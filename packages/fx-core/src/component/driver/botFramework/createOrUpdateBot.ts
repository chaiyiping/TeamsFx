// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Service } from "typedi";

import { hooks } from "@feathersjs/hooks/lib";
import { FxError, Result, SystemError, UserError } from "@microsoft/teamsfx-api";

import { getLocalizedString } from "../../../common/localizeUtils";
import { wrapRun } from "../../utils/common";
import { logMessageKeys } from "../aad/utility/constants";
import { DriverContext } from "../interface/commonArgs";
import { StepDriver } from "../interface/stepDriver";
import { addStartAndEndTelemetry } from "../middleware/addStartAndEndTelemetry";
import { InvalidParameterUserError } from "./error/invalidParameterUserError";
import { UnhandledSystemError } from "./error/unhandledError";
import { CreateOrUpdateBotFrameworkBotArgs } from "./interface/createOrUpdateBotFrameworkBotArgs";
import { BotRegistration } from "../../resource/botService/botRegistration/botRegistration";
import { LocalBotRegistration } from "../../resource/botService/botRegistration/localBotRegistration";
import { IBotRegistration } from "../../resource/botService/appStudio/interfaces/IBotRegistration";

const actionName = "botFramework/createOrUpdateBot";
const helpLink = "https://aka.ms/teamsfx-actions/botFramework-createOrUpdateBot";

@Service(actionName) // DO NOT MODIFY the service name
export class CreateOrUpdateBotFrameworkBotDriver implements StepDriver {
  @hooks([addStartAndEndTelemetry(actionName, actionName)])
  public async run(
    args: CreateOrUpdateBotFrameworkBotArgs,
    context: DriverContext
  ): Promise<Result<Map<string, string>, FxError>> {
    return wrapRun(() => this.handler(args, context));
  }

  private async handler(
    args: CreateOrUpdateBotFrameworkBotArgs,
    context: DriverContext
  ): Promise<Map<string, string>> {
    try {
      this.validateArgs(args);

      const botRegistrationData: IBotRegistration = {
        botId: args.botId,
        name: args.name,
        description: args.description ?? "",
        iconUrl: args.iconUrl ?? "",
        messagingEndpoint: args.messagingEndpoint,
        callingEndpoint: "",
      };

      const botRegistration: BotRegistration = new LocalBotRegistration();
      const result = await botRegistration.createOrUpdateBotRegistration(
        context.m365TokenProvider,
        botRegistrationData
      );

      if (result.isErr()) {
        throw result.error;
      }

      return new Map();
    } catch (error) {
      if (error instanceof UserError || error instanceof SystemError) {
        context.logProvider?.error(
          getLocalizedString(logMessageKeys.failExecuteDriver, actionName, error.displayMessage)
        );
        throw error;
      }

      const message = JSON.stringify(error);
      context.logProvider?.error(
        getLocalizedString(logMessageKeys.failExecuteDriver, actionName, message)
      );
      throw new UnhandledSystemError(actionName, message);
    }
  }

  private validateArgs(args: CreateOrUpdateBotFrameworkBotArgs): void {
    const invalidParameters: string[] = [];

    if (!args.botId || typeof args.botId !== "string") {
      invalidParameters.push("botId");
    }

    if (!args.name || typeof args.name !== "string") {
      invalidParameters.push("name");
    }

    if (!args.messagingEndpoint || typeof args.messagingEndpoint !== "string") {
      invalidParameters.push("messagingEndpoint");
    }

    if (args.description && typeof args.description !== "string") {
      invalidParameters.push("description");
    }

    if (args.iconUrl && typeof args.iconUrl !== "string") {
      invalidParameters.push("iconUrl");
    }

    if (invalidParameters.length > 0) {
      throw new InvalidParameterUserError(actionName, invalidParameters, helpLink);
    }
  }
}
