// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";
import * as tmp from "tmp";
import * as util from "util";

import axios from "axios";
import AdmZip from "adm-zip";

import { ConfigFolderName } from "@microsoft/teamsfx-api";
import { DepsCheckerError, VxTestAppCheckError } from "../depsError";
import { DepsLogger } from "../depsLogger";
import { DepsTelemetry } from "../depsTelemetry";
import { DepsChecker, DependencyStatus, DepsType, InstallOptions } from "../depsChecker";
import { isWindows } from "../util";
import { vxTestAppInstallHelpLink } from "../constant";

interface InstallOptionsSafe {
  version: string;
  projectPath: string;
}

// TODO: maybe change app name
const VxTestAppExecutableName = isWindows()
  ? "video-extensibility-test-app.exe"
  : "video-extensibility-test-app";
const VxTestAppDirRelPath = path.join(".tools", "video-extensibility-test-app");
const VxTestAppGlobalBasePath = path.join(
  os.homedir(),
  `.${ConfigFolderName}`,
  `bin`,
  `video-extensibility-test-app`
);
const VxTestAppDownloadTimeoutMillis = 5 * 60 * 1000;
// TODO: change to 
const VxTestAppDownloadUrlTemplate =
  "https://alexwang.blob.core.windows.net/public/testapp-v@version/video-extensibility-test-app-@platform-@arch.zip";

/**
 * Download a file from URL and save to a temporary file.
 * The temp file can only be used during callback. After that the temp file is deleted.
 *  */
async function downloadToTempFile(
  url: string,
  callback: (filePath: string) => Promise<void>
): Promise<void> {
  // name is full path
  const { name, removeCallback } = tmp.fileSync();
  try {
    const writer = fs.createWriteStream(name, { flags: "w" /* Open for write */ });
    const response = await axios.get(url, {
      responseType: "stream",
      timeout: VxTestAppDownloadTimeoutMillis,
    });
    response.data.pipe(writer);
    if (response.status !== 200) {
      throw new Error(`Failed to download from ${url}, HTTP status code ${response.status}`);
    }

    await new Promise<void>((resolve, reject) => {
      writer.on("error", (err) => {
        reject(err);
      });
      writer.on("finish", () => {
        resolve();
      });
    });

    await callback(name);
  } finally {
    removeCallback();
  }
}

async function unzip(zipFilePath: string, destinationPath: string): Promise<void> {
  // Create all parent dirs of destinationPath.
  await fs.mkdir(destinationPath, { recursive: true });
  const zip = new AdmZip(zipFilePath);
  await util.promisify(zip.extractAllToAsync)(destinationPath, true);
}

export class VxTestAppChecker implements DepsChecker {
  private readonly _logger: DepsLogger;
  private readonly _telemetry: DepsTelemetry;

  constructor(logger: DepsLogger, telemetry: DepsTelemetry) {
    this._logger = logger;
    this._telemetry = telemetry;
  }

  private async installVersion(version: string, installDir: string): Promise<void> {
    const downloadUrl = this.getDownloadUrl(version);
    await downloadToTempFile(downloadUrl, async (zipFilePath: string) => {
      await unzip(zipFilePath, installDir);
    });
  }

  private getDownloadUrl(version: string): string {
    const url = VxTestAppDownloadUrlTemplate.replace(/@version/g, version)
      .replace(/@platform/g, os.platform())
      .replace(/@arch/g, os.arch());

    return url;
  }

  private async createSymlink(target: string, linkFilePath: string): Promise<void> {
    // TODO: check if destination already exists
    try {
      const stat = await fs.lstat(linkFilePath);
      if (stat.isSymbolicLink()) {
        await fs.unlink(linkFilePath);
      }
    } catch (error: unknown) {
      const statError = error as { code?: string };
      if (statError.code !== "ENOENT") {
        throw error;
      }
    }
    await fs.mkdir(path.dirname(linkFilePath), { recursive: true });
    return await fs.symlink(
      target,
      linkFilePath,
      /* Only used for Windows. Directory junction is similar to directory link but does not require admin permission. */
      "junction"
    );
  }

  public async resolve(installOptions?: InstallOptions): Promise<DependencyStatus> {
    if (!this.isValidInstallOptions(installOptions)) {
      return VxTestAppChecker.newDependencyStatusForInstallError(
        new VxTestAppCheckError("Invalid installOptions", vxTestAppInstallHelpLink)
      );
    }

    // check install in project dir
    const installInfo = await this.getInstallationInfo(installOptions);
    if (installInfo.isInstalled) {
      return installInfo;
    }

    // ensure vxTestApp is installed in global dir
    const globalInstallDir = path.join(VxTestAppGlobalBasePath, installOptions.version);
    if (!(await this.isValidInstalltion(globalInstallDir, installOptions.version))) {
      await fs.remove(globalInstallDir);
      await this.installVersion(installOptions.version, globalInstallDir);
    }

    // ensure vxTestApp is installed in project dir
    const projectInstallDir = path.join(installOptions.projectPath, VxTestAppDirRelPath);
    await this.createSymlink(globalInstallDir, projectInstallDir);
    // TODO: need to chmod to add executable permission for non-Windows OS
    if (!(await this.isValidInstalltion(projectInstallDir, installOptions.version))) {
      return VxTestAppChecker.newDependencyStatusForInstallError(
        new VxTestAppCheckError(
          "Failed to validate installation in project.",
          vxTestAppInstallHelpLink
        )
      );
    }

    return {
      name: DepsType.VxTestApp,
      type: DepsType.VxTestApp,
      isInstalled: true,
      command: VxTestAppExecutableName,
      details: {
        isLinuxSupported: false,
        supportedVersions: [installOptions.version],
      },
      error: undefined,
    };
  }

  public async getInstallationInfo(installOptions?: InstallOptions): Promise<DependencyStatus> {
    if (!this.isValidInstallOptions(installOptions)) {
      return VxTestAppChecker.newDependencyStatusForInstallError(
        new VxTestAppCheckError("Invalid installOptions", vxTestAppInstallHelpLink)
      );
    }

    const installDir = path.join(installOptions.projectPath, VxTestAppDirRelPath);
    if (!(await this.isValidInstalltion(installDir, installOptions.version))) {
      return VxTestAppChecker.newDependencyStatusForNotInstalled(installOptions.version);
    }

    return {
      name: DepsType.VxTestApp,
      type: DepsType.VxTestApp,
      isInstalled: true,
      command: VxTestAppExecutableName,
      details: {
        isLinuxSupported: false,
        supportedVersions: [installOptions.version],
      },
      error: undefined,
    };
  }

  private async isValidInstalltion(installDir: string, version: string): Promise<boolean> {
    const vxTestAppExecutable = path.join(installDir, VxTestAppExecutableName);
    if (!fs.pathExistsSync(vxTestAppExecutable)) {
      return false;
    }

    // TODO(aochengwang):
    //   1. check executable permission for non-Windows OS
    //   2. check whether installed version is correct?
    return true;
  }

  private isValidInstallOptions(
    installOptions?: InstallOptions
  ): installOptions is InstallOptionsSafe {
    return !(installOptions?.projectPath === undefined && installOptions?.version === undefined);
  }

  private static newDependencyStatusForNotInstalled(version?: string): DependencyStatus {
    return {
      name: DepsType.VxTestApp,
      type: DepsType.VxTestApp,
      isInstalled: false,
      command: VxTestAppExecutableName,
      details: {
        isLinuxSupported: false,
        supportedVersions: version === undefined ? [] : [version],
      },
      error: undefined,
    };
  }

  private static newDependencyStatusForInstallError(
    error: DepsCheckerError,
    version?: string
  ): DependencyStatus {
    return {
      name: DepsType.VxTestApp,
      type: DepsType.VxTestApp,
      isInstalled: false,
      command: VxTestAppExecutableName,
      details: {
        isLinuxSupported: false,
        supportedVersions: version === undefined ? [] : [version],
      },
      error: error,
    };
  }
}
