import { err, FxError, ok, Result, SettingsFolderName, UserError } from "@microsoft/teamsfx-api";
import * as path from "path";
import fs from "fs-extra";
import { cloneDeep, merge } from "lodash";
import { settingsUtil } from "./settingsUtil";
import { LocalCrypto } from "../../core/crypto";
import { getDefaultString, getLocalizedString } from "../../common/localizeUtils";

export type DotenvOutput = {
  [k: string]: string;
};

export class EnvUtil {
  async readEnv(
    projectPath: string,
    env: string,
    loadToProcessEnv = true,
    silent = false
  ): Promise<Result<DotenvOutput, FxError>> {
    // read
    const dotEnvFilePath = path.join(projectPath, SettingsFolderName, `.env.${env}`);
    if (!(await fs.pathExists(dotEnvFilePath))) {
      if (silent) {
        return ok({});
      } else {
        return err(
          new UserError({
            source: "core",
            name: "DotEnvFileNotExistError",
            displayMessage: getLocalizedString("error.DotEnvFileNotExistError"),
            message: getDefaultString("error.DotEnvFileNotExistError"),
          })
        );
      }
    }
    // deserialize
    const parseResult = dotenvUtil.deserialize(await fs.readFile(dotEnvFilePath));

    // decrypt
    const settingsRes = await settingsUtil.readSettings(projectPath);
    if (settingsRes.isErr()) {
      return err(settingsRes.error);
    }
    const projectId = settingsRes.value.trackingId;
    const cryptoProvider = new LocalCrypto(projectId);
    for (const key of Object.keys(parseResult.obj)) {
      if (key.startsWith("SECRET_")) {
        const raw = parseResult.obj[key];
        const decryptRes = await cryptoProvider.decrypt(raw);
        if (decryptRes.isErr()) return err(decryptRes.error);
        parseResult.obj[key] = decryptRes.value;
      }
    }
    if (loadToProcessEnv) {
      merge(process.env, parseResult.obj);
    }
    return ok(parseResult.obj);
  }

  async writeEnv(
    projectPath: string,
    env: string,
    envs: DotenvOutput
  ): Promise<Result<undefined, FxError>> {
    //encrypt
    const settingsRes = await settingsUtil.readSettings(projectPath);
    if (settingsRes.isErr()) {
      return err(settingsRes.error);
    }
    const projectId = settingsRes.value.trackingId;
    const cryptoProvider = new LocalCrypto(projectId);
    for (const key of Object.keys(envs)) {
      let value = envs[key];
      if (value && key.startsWith("SECRET_")) {
        const res = await cryptoProvider.encrypt(value);
        if (res.isErr()) return err(res.error);
        value = res.value;
        envs[key] = value;
      }
    }

    //replace existing
    const dotEnvFilePath = path.join(projectPath, SettingsFolderName, `.env.${env}`);
    const parsedDotenv = (await fs.pathExists(dotEnvFilePath))
      ? dotenvUtil.deserialize(await fs.readFile(dotEnvFilePath))
      : { obj: {} };
    parsedDotenv.obj = envs;

    //serialize
    const content = dotenvUtil.serialize(parsedDotenv);

    //persist
    await fs.writeFile(dotEnvFilePath, content);

    return ok(undefined);
  }
  async listEnv(projectPath: string): Promise<Result<string[], FxError>> {
    const folder = path.join(projectPath, SettingsFolderName);
    const list = await fs.readdir(folder);
    const envs = list
      .filter((fileName) => fileName.startsWith(".env."))
      .map((fileName) => fileName.substring(5));
    return ok(envs);
  }
  object2map(obj: DotenvOutput): Map<string, string> {
    const map = new Map<string, string>();
    for (const key of Object.keys(obj)) {
      map.set(key, obj[key]);
    }
    return map;
  }
  map2object(map: Map<string, string>): DotenvOutput {
    const obj: DotenvOutput = {};
    for (const key of map.keys()) {
      obj[key] = map.get(key) || "";
    }
    return obj;
  }
}

export const envUtil = new EnvUtil();

const KEY_VALUE_PAIR_RE = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
const NEW_LINE_RE = /\\n/g;
const NEW_LINE_SPLITTER = /\n|\r|\r\n/;
const NEW_LINE = "\n";
type DotenvParsedLine = string | { key: string; value: string; comment?: string };
export interface DotenvParseResult {
  lines?: DotenvParsedLine[];
  obj: DotenvOutput;
}

export class DotenvUtil {
  deserialize(src: string | Buffer): DotenvParseResult {
    const lines: DotenvParsedLine[] = [];
    const obj: DotenvOutput = {};
    src
      .toString()
      .split(NEW_LINE_SPLITTER)
      .forEach(function (line, idx) {
        const kvMatchArray = line.match(KEY_VALUE_PAIR_RE);
        if (kvMatchArray !== null) {
          // match key-value pair
          const key = kvMatchArray[1];
          let value = kvMatchArray[2] || "";
          let inlineComment;
          const dQuoted = value[0] === '"' && value[value.length - 1] === '"';
          const sQuoted = value[0] === "'" && value[value.length - 1] === "'";
          if (sQuoted || dQuoted) {
            value = value.substring(1, value.length - 1);
            if (dQuoted) {
              value = value.replace(NEW_LINE_RE, NEW_LINE);
            }
          } else {
            value = value.trim();
            //try to match comment starter
            const index = value.indexOf("#");
            if (index >= 0) {
              inlineComment = value.substring(index);
              value = value.substring(0, index).trim();
            }
          }
          if (value) obj[key] = value;
          lines.push(
            inlineComment
              ? { key: key, value: value, comment: inlineComment }
              : { key: key, value: value }
          );
        } else {
          lines.push(line);
        }
      });
    return { lines: lines, obj: obj };
  }
  serialize(parsed: DotenvParseResult): string {
    const array: string[] = [];
    const obj = cloneDeep(parsed.obj);
    //append lines
    if (parsed.lines) {
      parsed.lines.forEach((line) => {
        if (typeof line === "string") {
          // keep comment line or empty line
          array.push(line);
        } else {
          if (obj[line.key] !== undefined) {
            // use kv in obj
            array.push(`${line.key}=${obj[line.key]}${line.comment ? " " + line.comment : ""}`);
            delete obj[line.key];
          } else {
            // keep original kv in lines
            array.push(`${line.key}=${line.value}${line.comment ? " " + line.comment : ""}`);
          }
        }
      });
    }
    //append additional kvs
    for (const key of Object.keys(obj)) {
      array.push(`${key}=${parsed.obj[key]}`);
    }
    return array.join("\n").trim();
  }
}

export const dotenvUtil = new DotenvUtil();
// const res = dotenvUtil.deserialize("#COMMENT\n\n\nKEY=VALUE#COMMENT2");
// console.log(res);
// res.obj["KEY"] = "VALUE@@@";
// console.log(dotenvUtil.serialize(res));
