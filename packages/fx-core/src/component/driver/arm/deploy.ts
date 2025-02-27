// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { StepDriver } from "../interface/stepDriver";
import { DriverContext } from "../interface/commonArgs";
import { Service } from "typedi";
import { Constants } from "./constant";
import { deployArgs } from "./interface";
import { ArmDeployImpl } from "./deployImpl";
import { FxError, Result } from "@microsoft/teamsfx-api";
import { WrapDriverContext, wrapRun } from "../util/wrapUtil";

@Service(Constants.actionName) // DO NOT MODIFY the service name
export class ArmDeployDriver implements StepDriver {
  public async run(
    args: deployArgs,
    context: DriverContext
  ): Promise<Result<Map<string, string>, FxError>> {
    const wrapContext = new WrapDriverContext(context, Constants.actionName, Constants.actionName);
    const impl = new ArmDeployImpl(args, wrapContext);
    return wrapRun(wrapContext, () => impl.run());
  }
}
