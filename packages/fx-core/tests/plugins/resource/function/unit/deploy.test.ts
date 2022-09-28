// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import "mocha";
import * as chai from "chai";
import * as fs from "fs-extra";
import * as path from "path";
import * as sinon from "sinon";
import axios from "axios";

import { funcDepsHelper } from "../../../../../src/plugins/resource/function/utils/depsChecker/funcHelper";

import * as dirWalk from "../../../../../src/plugins/resource/function/utils/dir-walk";
import * as execute from "../../../../../src/plugins/resource/function/utils/execute";
import { AzureClientFactory } from "../../../../../src/plugins/resource/function/utils/azure-client";
import {
  DependentPluginInfo,
  FunctionPluginInfo,
} from "../../../../../src/plugins/resource/function/constants";
import { FunctionDeploy } from "../../../../../src/plugins/resource/function/ops/deploy";
import { FunctionLanguage } from "../../../../../src/plugins/resource/function/enums";
import { FunctionPlugin } from "../../../../../src/plugins/resource/function";
import { Platform } from "@microsoft/teamsfx-api";
import { newEnvInfo } from "../../../../../src/core/environment";
import { AccessToken, GetTokenOptions, TokenCredential } from "@azure/core-auth";

class MyTokenCredential implements TokenCredential {
  async getToken(
    scopes: string | string[],
    options?: GetTokenOptions | undefined
  ): Promise<AccessToken | null> {
    return {
      token: "a.eyJ1c2VySWQiOiJ0ZXN0QHRlc3QuY29tIn0=.c",
      expiresOnTimestamp: 1234,
    };
  }
}

const context: any = {
  envInfo: newEnvInfo(
    undefined,
    undefined,
    new Map<string, Map<string, string>>([
      [
        DependentPluginInfo.solutionPluginName,
        new Map<string, string>([
          [DependentPluginInfo.subscriptionId, "ut"],
          [DependentPluginInfo.resourceGroupName, "ut"],
          [DependentPluginInfo.resourceNameSuffix, "ut"],
          [DependentPluginInfo.location, "ut"],
        ]),
      ],
      [
        DependentPluginInfo.aadPluginName,
        new Map<string, string>([
          [DependentPluginInfo.aadClientId, "ut"],
          [DependentPluginInfo.aadClientSecret, "ut"],
          [DependentPluginInfo.oauthHost, "ut"],
          [DependentPluginInfo.tenantId, "ut"],
        ]),
      ],
      [
        DependentPluginInfo.frontendPluginName,
        new Map<string, string>([
          [DependentPluginInfo.frontendDomain, "ut"],
          [DependentPluginInfo.frontendEndpoint, "ut"],
        ]),
      ],
      [
        DependentPluginInfo.identityPluginName,
        new Map<string, string>([
          [DependentPluginInfo.identityClientId, "ut"],
          [DependentPluginInfo.oauthHost, "ut"],
          [DependentPluginInfo.tenantId, "ut"],
        ]),
      ],
      [
        DependentPluginInfo.sqlPluginName,
        new Map<string, string>([
          [DependentPluginInfo.sqlPluginName, "ut"],
          [DependentPluginInfo.sqlEndpoint, "ut"],
          [DependentPluginInfo.databaseName, "ut"],
        ]),
      ],
      [
        DependentPluginInfo.apimPluginName,
        new Map<string, string>([[DependentPluginInfo.apimAppId, "ut"]]),
      ],
    ])
  ),
  app: {
    name: {
      short: "ut",
    },
  },
  projectSettings: {
    appName: "ut",
    programmingLanguage: "javascript",
  },
  config: new Map<string, string>([
    ["functionAppName", "ut"],
    [
      "functionAppResourceId",
      "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test-rg/providers/Microsoft.Web/sites/ut",
    ],
  ]),
  azureAccountProvider: {
    getIdentityCredentialAsync: async () => {
      return new MyTokenCredential();
    },
    getSelectedSubscription: async () => {
      return {
        subscriptionId: "subscriptionId",
        tenantId: "tenantId",
        subscriptionName: "subscriptionName",
      };
    },
  },
  root: path.join(__dirname, "ut"),
  answers: { platform: Platform.VSCode },
};

describe(FunctionPluginInfo.pluginName, () => {
  describe("Function Deploy Test", () => {
    afterEach(() => {
      fs.emptyDirSync(context.root);
      fs.rmdirSync(context.root);
      sinon.restore();
    });

    it("Test deploy without change", async () => {
      // Arrange
      sinon.stub(FunctionDeploy, "hasUpdatedContent").resolves(false);
      const plugin: FunctionPlugin = new FunctionPlugin();

      // Act
      const res1 = await plugin.preDeploy(context);
      const res2 = await plugin.deploy(context);

      // Assert
      chai.assert.isTrue(res1.isOk());
      chai.assert.isTrue(res2.isOk());
    });

    it("Test deploy with change", async () => {
      // Arrange
      const apiPath = path.join(context.root, "api");
      await fs.emptyDir(apiPath);
      await fs.writeFile(path.join(apiPath, ".funcignore"), "ut");
      await fs.writeFile(path.join(apiPath, "ut.js"), "ut");
      sinon.stub(AzureClientFactory, "getWebSiteManagementClient").returns({
        webApps: {
          updateApplicationSettings: () => undefined,
          listApplicationSettings: () => [],
          restart: () => undefined,
          syncFunctionTriggers: () => undefined,
          beginListPublishingCredentialsAndWait: () => ({
            publishingUserName: "ut",
            publishingPassword: "ut",
          }),
        },
      } as any);
      sinon.stub(axios, "post").resolves({ status: 200 });
      sinon.stub(execute, "execute").resolves("");
      sinon.stub(FunctionDeploy, "hasUpdatedContent").resolves(true);
      sinon.stub(funcDepsHelper, "installFuncExtension").resolves(undefined);
      const plugin: FunctionPlugin = new FunctionPlugin();

      // Act
      const res1 = await plugin.preDeploy(context);
      const res2 = await plugin.deploy(context);

      // Assert
      chai.assert.isTrue(res1.isOk());
      chai.assert.isTrue(res2.isOk());
    });

    it("Test hasUpdatedContent got last deployment time", async () => {
      // Arrange
      sinon.stub(FunctionDeploy, "getLastDeploymentTime").resolves(new Date());
      sinon.stub(dirWalk, "forEachFileAndDir").resolves(undefined);

      // Act
      const res = await FunctionDeploy.hasUpdatedContent("ut", FunctionLanguage.JavaScript, "ut");

      // Assert
      chai.assert.isFalse(res);
    });

    it("Test hasUpdatedContent fail to get last deployment time", async () => {
      // Arrange
      sinon.stub(dirWalk, "forEachFileAndDir").resolves(undefined);

      // Act
      const res = await FunctionDeploy.hasUpdatedContent("ut", FunctionLanguage.JavaScript, "ut");

      // Assert
      chai.assert.isTrue(res);
    });
  });
});
