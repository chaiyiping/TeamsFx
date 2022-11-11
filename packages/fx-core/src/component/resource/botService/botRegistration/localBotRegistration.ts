// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IBotRegistration } from "../appStudio/interfaces/IBotRegistration";
import { err, FxError, Result, ok, M365TokenProvider, LogProvider } from "@microsoft/teamsfx-api";
import { AppStudioScopes } from "../../../../common/tools";
import { AppStudioClient } from "../appStudio/appStudioClient";
import { BotRegistration, BotAuthType, BotAadCredentials } from "./botRegistration";
import { Messages } from "../messages";
import { MissingRequiredArgumentsError } from "../errors";

export class LocalBotRegistration extends BotRegistration {
  public async createBotRegistration(
    botAuthType: BotAuthType,
    botConfig: BotAadCredentials,
    aadDisplayName?: string,
    botRegistration?: IBotRegistration,
    isIdFromState?: boolean,
    m365TokenProvider?: M365TokenProvider,
    logProvider?: LogProvider
  ): Promise<Result<BotAadCredentials, FxError>> {
    const botAadRes = await super.createBotAuth(
      botAuthType,
      aadDisplayName,
      botConfig,
      m365TokenProvider,
      logProvider
    );
    if (botAadRes.isErr()) {
      return err(botAadRes.error);
    }
    logProvider?.info(Messages.SuccessfullyCreatedBotAadApp);

    const botAadCredentials: BotAadCredentials = botAadRes.value;

    logProvider?.info(Messages.ProvisioningBotRegistration);
    if (!m365TokenProvider || !botRegistration) {
      throw new MissingRequiredArgumentsError();
    }
    const appStudioTokenRes = await m365TokenProvider.getAccessToken({
      scopes: AppStudioScopes,
    });
    if (appStudioTokenRes.isErr()) {
      return err(appStudioTokenRes.error);
    }

    const appStudioToken = appStudioTokenRes.value;
    // Register a new bot registration.
    await AppStudioClient.createBotRegistration(appStudioToken, botRegistration, isIdFromState);
    logProvider?.info(Messages.SuccessfullyProvisionedBotRegistration);
    return ok(botAadCredentials);
  }

  public async updateBotRegistration(
    m365TokenProvider: M365TokenProvider,
    botRegistration: IBotRegistration
  ): Promise<Result<undefined, FxError>> {
    if (!botRegistration.botId) {
      throw new MissingRequiredArgumentsError();
    }
    const appStudioTokenRes = await m365TokenProvider.getAccessToken({
      scopes: AppStudioScopes,
    });
    if (appStudioTokenRes.isErr()) {
      return err(appStudioTokenRes.error);
    }
    const appStudioToken = appStudioTokenRes.value;
    const remoteBotRegistration = await AppStudioClient.getBotRegistration(
      appStudioToken,
      botRegistration.botId
    );

    botRegistration.callingEndpoint = 
    await AppStudioClient.updateBotRegistration(appStudioToken, botRegistration);
    return ok(undefined);
  }

  public async updateMessageEndpoint(
    m365TokenProvider: M365TokenProvider,
    botId: string,
    endpoint: string
  ): Promise<Result<undefined, FxError>> {
    const appStudioTokenRes = await m365TokenProvider.getAccessToken({
      scopes: AppStudioScopes,
    });
    if (appStudioTokenRes.isErr()) {
      return err(appStudioTokenRes.error);
    }
    const appStudioToken = appStudioTokenRes.value;
    await AppStudioClient.updateMessageEndpoint(appStudioToken, botId, endpoint);
    return ok(undefined);
  }
}
