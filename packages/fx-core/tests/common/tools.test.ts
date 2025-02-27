// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import "mocha";
import axios, { AxiosResponse } from "axios";
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import * as sinon from "sinon";

import {
  getSideloadingStatus,
  canAddApiConnection,
  canAddSso,
  getFixedCommonProjectSettings,
  canAddCICDWorkflows,
  getSPFxVersion,
  getAppSPFxVersion,
} from "../../src/common/tools";
import * as telemetry from "../../src/common/telemetry";
import {
  AzureSolutionSettings,
  InputsWithProjectPath,
  ok,
  Platform,
  ProjectSettings,
  Settings,
  v2,
} from "@microsoft/teamsfx-api";
import { TabSsoItem } from "../../src/component/constants";
import * as featureFlags from "../../src/common/featureFlags";
import fs from "fs-extra";
import { environmentManager } from "../../src/core/environment";
import { ExistingTemplatesStat } from "../../src/component/feature/cicd/existingTemplatesStat";
import mockedEnv from "mocked-env";
import { FeatureFlagName } from "../../src/common/constants";

chai.use(chaiAsPromised);

describe("tools", () => {
  describe("getSideloadingStatus()", () => {
    let mockGet: () => AxiosResponse;
    let events: number;
    let errors: number;

    beforeEach(() => {
      sinon.restore();

      const mockInstance = axios.create();
      sinon.stub(mockInstance, "get").callsFake(async () => mockGet());
      sinon.stub(axios, "create").returns(mockInstance);

      events = 0;
      sinon.stub(telemetry, "sendTelemetryEvent").callsFake(() => {
        ++events;
      });

      errors = 0;
      sinon.stub(telemetry, "sendTelemetryErrorEvent").callsFake(() => {
        ++errors;
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    it("sideloading enabled", async () => {
      mockGet = () => {
        return {
          status: 200,
          data: {
            value: {
              isSideloadingAllowed: true,
            },
          },
        } as AxiosResponse;
      };

      const result = await getSideloadingStatus("fake-token");

      chai.assert.isDefined(result);
      chai.assert.isTrue(result);
      chai.assert.equal(events, 1);
      chai.assert.equal(errors, 0);
    });

    it("sideloading not enabled", async () => {
      mockGet = () => {
        return {
          status: 200,
          data: {
            value: {
              isSideloadingAllowed: false,
            },
          },
        } as AxiosResponse;
      };

      const result = await getSideloadingStatus("fake-token");

      chai.assert.isDefined(result);
      chai.assert.isFalse(result);
      chai.assert.equal(events, 1);
      chai.assert.equal(errors, 0);
    });

    it("sideloading unknown", async () => {
      mockGet = () => {
        return {
          status: 200,
          data: {
            value: {
              foo: "bar",
            },
          },
        } as AxiosResponse;
      };

      const result = await getSideloadingStatus("fake-token");

      chai.assert.isUndefined(result);
      chai.assert.equal(events, 0);
      chai.assert.equal(errors, 1);
    });

    it("error and retry", async () => {
      mockGet = () => {
        throw new Error("test");
      };
      const clock = sinon.useFakeTimers();

      const resultPromise = getSideloadingStatus("fake-token");
      await clock.tickAsync(100000);
      const result = await resultPromise;
      clock.restore();

      chai.assert.isUndefined(result);
      chai.assert.equal(events, 0);
      chai.assert.equal(errors, 3);
    });
  });

  describe("canAddApiConnection()", () => {
    it("returns true when function is added", async () => {
      const solutionSettings: AzureSolutionSettings = {
        activeResourcePlugins: ["fx-resource-function"],
        hostType: "Azure",
        capabilities: [],
        azureResources: [],
        name: "test",
      };

      const result = canAddApiConnection(solutionSettings);

      chai.assert.isDefined(result);
      chai.assert.isTrue(result);
    });

    it("returns true when bot is added", async () => {
      const solutionSettings: AzureSolutionSettings = {
        activeResourcePlugins: ["fx-resource-bot"],
        hostType: "Azure",
        capabilities: [],
        azureResources: [],
        name: "test",
      };

      const result = canAddApiConnection(solutionSettings);

      chai.assert.isDefined(result);
      chai.assert.isTrue(result);
    });

    it("returns false when bot or function is not added", async () => {
      const solutionSettings: AzureSolutionSettings = {
        activeResourcePlugins: [],
        hostType: "Azure",
        capabilities: [],
        azureResources: [],
        name: "test",
      };

      const result = canAddApiConnection(solutionSettings);

      chai.assert.isDefined(result);
      chai.assert.isFalse(result);
    });
  });

  describe("canAddSso()", () => {
    beforeEach(() => {
      sinon.stub<any, any>(featureFlags, "isFeatureFlagEnabled").returns(true);
    });
    afterEach(() => {
      sinon.restore();
    });

    it("returns true when nothing is added", async () => {
      const projectSettings: ProjectSettings = {
        solutionSettings: {
          activeResourcePlugins: ["fx-resource-function"],
          hostType: "Azure",
          capabilities: [],
          azureResources: [],
          name: "test",
        },
        appName: "test",
        projectId: "projectId",
      };

      const result = canAddSso(projectSettings);

      chai.assert.isDefined(result);
      chai.assert.isTrue(result);
    });

    it("returns false when tab sso is added", async () => {
      const projectSettings: ProjectSettings = {
        solutionSettings: {
          activeResourcePlugins: ["fx-resource-aad-app-for-teams"],
          hostType: "Azure",
          capabilities: [TabSsoItem.id],
          azureResources: [],
          name: "test",
        },
        appName: "test",
        projectId: "projectId",
      };

      const result = canAddSso(projectSettings);

      chai.assert.isDefined(result);
      chai.assert.isFalse(result);
    });
  });

  describe("getFixedCommonProjectSettings", () => {
    const sandbox = sinon.createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it("happy path", async () => {
      const projectSettings: ProjectSettings = {
        appName: "app-name",
        projectId: "project-id",
        version: "0.0.0",
        isFromSample: false,
        isM365: false,
        solutionSettings: {
          name: "fx-solution-azure",
          version: "1.0.0",
          hostType: "Azure",
          azureResources: [],
          capabilities: ["Tab", "Bot"],
          activeResourcePlugins: [
            "fx-resource-frontend-hosting",
            "fx-resource-identity",
            "fx-resource-bot",
            "fx-resource-local-debug",
            "fx-resource-appstudio",
            "fx-resource-cicd",
            "fx-resource-api-connector",
          ],
        },
        programmingLanguage: "typescript",
        pluginSettings: {
          "fx-resource-bot": {
            "host-type": "app-service",
          },
        },
      };

      sandbox.stub<any, any>(fs, "readJsonSync").callsFake((file: string) => {
        return projectSettings;
      });
      sandbox.stub<any, any>(fs, "pathExistsSync").callsFake((file: string) => {
        return true;
      });

      const result = getFixedCommonProjectSettings("root-path");
      chai.assert.isNotEmpty(result);
      chai.assert.equal(result!.projectId, projectSettings.projectId);
      chai.assert.equal(result!.programmingLanguage, projectSettings.programmingLanguage);
      chai.assert.equal(result!.isFromSample, projectSettings.isFromSample);
      chai.assert.equal(result!.isM365, projectSettings.isM365);
      chai.assert.equal(result!.hostType, projectSettings.solutionSettings?.hostType);
    });

    it("happy path V3", async () => {
      const restore = mockedEnv({
        TEAMSFX_V3: "true",
      });
      try {
        const settings: Settings = {
          trackingId: "tracking-id",
          version: "0.0.0",
        };

        sandbox.stub<any, any>(fs, "readJsonSync").callsFake((file: string) => {
          return settings;
        });
        sandbox.stub<any, any>(fs, "pathExistsSync").callsFake((file: string) => {
          return true;
        });

        const result = getFixedCommonProjectSettings("root-path");
        chai.assert.isNotEmpty(result);
        chai.assert.equal(result!.projectId, settings.trackingId);
      } finally {
        restore();
      }
    });

    it("project settings not exists", async () => {
      sandbox.stub<any, any>(fs, "pathExistsSync").callsFake((file: string) => {
        return false;
      });
      const result = getFixedCommonProjectSettings("root-path");
      chai.assert.isUndefined(result);
    });

    it("throw error", async () => {
      sandbox.stub<any, any>(fs, "pathExistsSync").callsFake((file: string) => {
        throw new Error("new error");
      });
      const result = getFixedCommonProjectSettings("root-path");
      chai.assert.isUndefined(result);
    });

    it("empty root path", async () => {
      const result = getFixedCommonProjectSettings("");
      chai.assert.isUndefined(result);
    });
  });

  describe("canAddCICDWorkflows", () => {
    beforeEach(() => {
      sinon.stub<any, any>(featureFlags, "isFeatureFlagEnabled").returns(true);
    });
    afterEach(() => {
      sinon.restore();
    });

    it("returns true in SPFx project", async () => {
      sinon.stub(environmentManager, "listRemoteEnvConfigs").returns(Promise.resolve(ok(["test"])));
      sinon.stub(ExistingTemplatesStat.prototype, "notExisting").returns(true);

      const projectSettings = {
        appName: "test",
        projectId: "projectId",
        version: "2.1.0",
        isFromSample: false,
        components: [],
        programmingLanguage: "javascript",
        solutionSettings: {
          name: "fx-solution-azure",
          version: "1.0.0",
          hostType: "SPFx",
          azureResources: [],
          capabilities: ["Tab"],
          activeResourcePlugins: [
            "fx-resource-spfx",
            "fx-resource-local-debug",
            "fx-resource-appstudio",
          ],
        },
      };
      const inputs: InputsWithProjectPath = {
        platform: Platform.VSCode,
        projectPath: ".",
      };

      const result = await canAddCICDWorkflows(inputs, {
        projectSetting: projectSettings,
      } as unknown as v2.Context);

      chai.assert.isTrue(result);
    });
  });

  describe("getSPFxVersion", () => {
    it("Set 1.15.0", () => {
      const mockedEnvRestore = mockedEnv({ [FeatureFlagName.SPFxVersion]: "1.15.0" });

      const version = getSPFxVersion();

      chai.expect(version).equal("1.15.0");
      mockedEnvRestore();
    });

    it("Set 1.16.0 - beta.1", () => {
      const mockedEnvRestore = mockedEnv({ [FeatureFlagName.SPFxVersion]: "1.16.0-beta.1" });

      const version = getSPFxVersion();

      chai.expect(version).equal("1.16.0-beta.1");
      mockedEnvRestore();
    });

    it("Default is 1.15.0 when not set", () => {
      const mockedEnvRestore = mockedEnv({ [FeatureFlagName.SPFxVersion]: undefined });

      const version = getSPFxVersion();

      chai.expect(version).equal("1.15.0");
      mockedEnvRestore();
    });
  });

  describe("getAppSPFxVersion", async () => {
    afterEach(() => {
      sinon.restore();
    });

    it("Returns version from .yo-rc.json", async () => {
      sinon.stub(fs, "pathExists").resolves(true);
      sinon.stub(fs, "readJson").resolves({
        "@microsoft/generator-sharepoint": {
          version: "1.15.0",
        },
      });

      const version = await getAppSPFxVersion("");

      chai.expect(version).equals("1.15.0");
    });

    it("Returns version from package.json when .yo-rc.json not exist", async () => {
      sinon.stub(fs, "pathExists").callsFake((directory) => {
        if (directory.includes(".yo-rc.json")) {
          return false;
        }
        return true;
      });
      sinon.stub(fs, "readJson").resolves({
        dependencies: {
          "@microsoft/sp-webpart-base": "1.14.0",
        },
      });

      const version = await getAppSPFxVersion("");

      chai.expect(version).equals("1.14.0");
    });
  });
});
