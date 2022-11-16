// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { LogLevel, ok } from "@microsoft/teamsfx-api";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import fs from "fs-extra";
import sinon from "sinon";
import yargs, { Options } from "yargs";

import { expect } from "../../utils";
import M365 from "../../../../src/cmds/m365/m365";
import M365TokenProvider from "../../../../src/commonlib/m365Login";
import CLILogProvider from "../../../../src/commonlib/log";
import { signedIn } from "../../../../src/commonlib/common/constant";

describe("M365", () => {
  const sandbox = sinon.createSandbox();
  let registeredCommands: string[] = [];
  let logs: string[] = [];
  let axiosDeleteResponses: Record<string, unknown> = {};
  let axiosGetResponses: Record<string, unknown> = {};
  let axiosPostResponses: Record<string, unknown> = {};
  const testAxiosInstance = {
    defaults: {
      headers: {
        common: {},
      },
    },
    delete: function <T = any, R = AxiosResponse<T>>(
      url: string,
      config?: AxiosRequestConfig
    ): Promise<R> {
      return Promise.resolve(axiosDeleteResponses[url] as R);
    },
    get: function <T = any, R = AxiosResponse<T>>(url: string): Promise<R> {
      return Promise.resolve(axiosGetResponses[url] as R);
    },
    post: function <T = any, R = AxiosResponse<T>>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<R> {
      return Promise.resolve(axiosPostResponses[url] as R);
    },
  } as AxiosInstance;

  afterEach(() => {
    sandbox.restore();
  });

  beforeEach(() => {
    registeredCommands = [];
    logs = [];
    axiosDeleteResponses = {};
    axiosGetResponses = {};
    axiosPostResponses = {};
    sandbox
      .stub<any, any>(yargs, "command")
      .callsFake((command: string, description: string, builder: any, handler: any) => {
        registeredCommands.push(command);
        builder(yargs);
      });
    sandbox.stub(yargs, "options").callsFake((ops: { [key: string]: Options }) => {
      return yargs;
    });
    sandbox.stub(CLILogProvider, "necessaryLog").callsFake((level: LogLevel, message: string) => {
      logs.push(message);
    });
    sandbox.stub(CLILogProvider, "debug").callsFake((message: string) => {
      return Promise.resolve(false);
    });
    sandbox.stub(M365TokenProvider, "getAccessToken").returns(Promise.resolve(ok("test-token")));
    sandbox
      .stub(M365TokenProvider, "getStatus")
      .returns(Promise.resolve(ok({ status: signedIn, accountInfo: { upn: "test" } })));
    sandbox.stub(fs, "readFile").callsFake((file) => {
      return Promise.resolve(Buffer.from("test"));
    });
    sandbox.stub(axios, "create").returns(testAxiosInstance);
  });

  it("M365 is empty command", async () => {
    const m365 = new M365();
    m365.builder(yargs);
    expect(registeredCommands).deep.equals(["sideloading", "unacquire", "launchinfo"]);

    const res = await m365.runCommand({});
    expect(res.isOk()).to.be.true;
    expect((res as any).value).equals(null);
  });

  it("M365 Sideloading command", async () => {
    const m365 = new M365();
    const sideloading = m365.subCommands.find((cmd) => cmd.commandHead === "sideloading");
    expect(sideloading).not.undefined;

    axiosPostResponses["/dev/v1/users/packages"] = {
      data: {
        operationId: "test-operation-id",
        titlePreview: {
          titleId: "test-title-id",
        },
      },
    };
    axiosPostResponses["/dev/v1/users/packages/acquisitions"] = {
      data: {
        statusId: "test-status-id",
      },
    };
    axiosGetResponses["/dev/v1/users/packages/status/test-status-id"] = {
      status: 200,
    };
    axiosGetResponses["/catalog/v1/users/titles/test-title-id/launchInfo"] = {
      data: {
        test: "test",
      },
    };

    await sideloading!.handler({ "file-path": "test" });
    expect(logs.length).greaterThan(0);
    const finalLog = logs[logs.length - 1];
    expect(finalLog).equals("Sideloading done.");
  });

  it("M365 Unacquire command (title-id)", async () => {
    const m365 = new M365();
    const unacquire = m365.subCommands.find((cmd) => cmd.commandHead === "unacquire");
    expect(unacquire).not.undefined;

    axiosDeleteResponses["/catalog/v1/users/acquisitions/test-title-id"] = {
      status: 200,
    };

    await unacquire!.handler({ "title-id": "test-title-id" });
    expect(logs.length).greaterThan(0);
    const finalLog = logs[logs.length - 1];
    expect(finalLog).equals("Unacquiring done.");
  });

  it("M365 Unacquire command (manifest-id)", async () => {
    const m365 = new M365();
    const unacquire = m365.subCommands.find((cmd) => cmd.commandHead === "unacquire");
    expect(unacquire).not.undefined;

    axiosPostResponses["/catalog/v1/users/titles/launchInfo"] = {
      data: {
        acquisition: {
          titleId: {
            id: "test-title-id",
          },
        },
      },
    };
    axiosDeleteResponses["/catalog/v1/users/acquisitions/test-title-id"] = {
      status: 200,
    };

    await unacquire!.handler({ "manifest-id": "test" });
    expect(logs.length).greaterThan(0);
    const finalLog = logs[logs.length - 1];
    expect(finalLog).equals("Unacquiring done.");
  });

  it("M365 LaunchInfo command (title-id)", async () => {
    const m365 = new M365();
    const launchInfo = m365.subCommands.find((cmd) => cmd.commandHead === "launchinfo");
    expect(launchInfo).not.undefined;

    axiosGetResponses["/catalog/v1/users/titles/test-title-id/launchInfo"] = {
      data: {
        foo: "bar",
      },
    };

    await launchInfo!.handler({ "title-id": "test-title-id" });
    expect(logs.length).greaterThan(0);
    const finalLog = logs[logs.length - 1];
    expect(finalLog).equals(JSON.stringify({ foo: "bar" }));
  });

  it("M365 LaunchInfo command (manifest-id)", async () => {
    const m365 = new M365();
    const launchInfo = m365.subCommands.find((cmd) => cmd.commandHead === "launchinfo");
    expect(launchInfo).not.undefined;

    axiosPostResponses["/catalog/v1/users/titles/launchInfo"] = {
      data: {
        acquisition: {
          titleId: {
            id: "test-title-id",
          },
        },
      },
    };
    axiosGetResponses["/catalog/v1/users/titles/test-title-id/launchInfo"] = {
      data: {
        foo: "bar",
      },
    };

    await launchInfo!.handler({ "manifest-id": "test" });
    expect(logs.length).greaterThan(0);
    const finalLog = logs[logs.length - 1];
    expect(finalLog).equals(JSON.stringify({ foo: "bar" }));
  });

  it("M365 LaunchInfo command (undefined)", async () => {
    const m365 = new M365();
    const launchInfo = m365.subCommands.find((cmd) => cmd.commandHead === "launchinfo");
    expect(launchInfo).not.undefined;

    const result = await launchInfo!.runCommand({});
    expect(result).not.undefined;
    expect(result.isErr()).to.be.true;
  });
});
