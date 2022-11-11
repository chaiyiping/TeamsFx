// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
  err,
  FxError,
  Result,
  ok,
  M365TokenProvider,
  NotImplementedError,
  LogProvider,
} from "@microsoft/teamsfx-api";
import { getLocalizedString } from "../../../../common/localizeUtils";
import { GraphScopes } from "../../../../common/tools";
import { IBotRegistration } from "../appStudio/interfaces/IBotRegistration";
import { MissingRequiredArgumentsError } from "../errors";
import { logMessageKeys } from "./constants";
import { GraphClient } from "./graphClient";

export enum BotAuthType {
  AADApp = "AADApp",
  Identity = "User-Assigned Managed Identity", // TODO: Make room for potential changes in the future.
}

export interface BotAadCredentials {
  botId: string;
  botPassword: string;
}

export class Constants {
  public static readonly BOT_REGISTRATION: string = "BotRegistration";
  public static readonly CREATE_BOT_REGISTRATION: string = "createBotRegistration";
  public static readonly UPDATE_BOT_REGISTRATION: string = "updateBotRegistration";
  public static readonly UPDATE_MESSAGE_ENDPOINT: string = "updateMessageEndpoint";
  public static readonly MSI_FOR_BOT: string = "MSI Support for Bot";
}

export class BotRegistration {
  // Create authentication (AAD App, MSI) for Bot.
  public async createBotAuth(
    botAuthType: BotAuthType,
    aadDisplayName?: string,
    botConfig?: BotAadCredentials,
    m365TokenProvider?: M365TokenProvider,
    logProvider?: LogProvider
  ): Promise<Result<BotAadCredentials, FxError>> {
    logProvider?.info(getLocalizedString(logMessageKeys.startCreateBotAadApp));
    if (botAuthType === BotAuthType.AADApp) {
      if (botConfig?.botId && botConfig?.botPassword) {
        // Existing bot aad scenario.
        logProvider?.info(getLocalizedString(logMessageKeys.skipCreateBotAadApp));
        return ok(botConfig);
      } else {
        // Check necessary parameters.
        if (!m365TokenProvider || !aadDisplayName) {
          throw new MissingRequiredArgumentsError();
        }
        // Create a new bot aad app.
        // Prepare graph token.
        const graphTokenRes = await m365TokenProvider?.getAccessToken({
          scopes: GraphScopes,
        });

        if (graphTokenRes.isErr()) {
          return err(graphTokenRes.error);
        }
        const graphToken = graphTokenRes.value;

        // Call GraphClient.
        try {
          const aadAppCredential = await GraphClient.registerAadApp(graphToken, aadDisplayName);
          logProvider?.info(getLocalizedString(logMessageKeys.successCreateBotAadApp));
          return ok({
            botId: aadAppCredential.clientId,
            botPassword: aadAppCredential.clientSecret,
          });
        } catch (e) {
          logProvider?.info(getLocalizedString(logMessageKeys.failCreateBotAadApp, e.genMessage()));
          return err(e);
        }
      }
    } else {
      // Suppose === BotAuthType.Identity
      //TODO: Support identity.
      return err(new NotImplementedError(Constants.BOT_REGISTRATION, Constants.MSI_FOR_BOT));
    }
  }

  public async createBotRegistration(
    botAuthType: BotAuthType = BotAuthType.AADApp,
    botConfig: BotAadCredentials,
    aadDisplayName?: string,
    botRegistration?: IBotRegistration, // Used to set metadata (iconUrl, callingEndpoint and so on) along with creation.
    isIdFromState?: boolean,
    m365TokenProvider?: M365TokenProvider,
    logProvider?: LogProvider
  ): Promise<Result<BotAadCredentials, FxError>> {
    return err(
      new NotImplementedError(Constants.BOT_REGISTRATION, Constants.CREATE_BOT_REGISTRATION)
    );
  }

  public async updateBotRegistration(
    m365TokenProvider: M365TokenProvider,
    botRegistration: IBotRegistration
  ): Promise<Result<undefined, FxError>> {
    return err(
      new NotImplementedError(Constants.BOT_REGISTRATION, Constants.UPDATE_BOT_REGISTRATION)
    );
  }

  public async updateMessageEndpoint(
    m365TokenProvider: M365TokenProvider,
    botId: string,
    endpoint: string
  ): Promise<Result<undefined, FxError>> {
    return err(
      new NotImplementedError(Constants.BOT_REGISTRATION, Constants.UPDATE_MESSAGE_ENDPOINT)
    );
  }
}
