// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
  LogLevel,
  setLogLevel,
  setLogFunction,
  TeamsUserCredentialAuthConfig,
  TeamsUserCredential,
} from "@microsoft/teamsfx";
import { useTeams } from "./useTeams";
import { ThemePrepared } from "@fluentui/react-northstar";
import { useData } from "./useData";

export type TeamsContextWithCredential = {
  /**
   * Instance of TeamsUserCredential.
   */
  teamsUserCredential?: TeamsUserCredential;
  /**
   * Status of data loading.
   */
  loading: boolean;
  /**
   * Error information.
   */
  error: unknown;
  /**
   * Indicates that current environment is in Teams
   */
  inTeams?: boolean;
  /**
   * Teams theme.
   */
  theme: ThemePrepared;
  /**
   * Teams theme string.
   */
  themeString: string;
  /**
   * Teams context object.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
};

/**
 * Initialize TeamsFx SDK with customized configuration.
 *
 * @param authConfig - custom configuration to override default ones.
 * @returns TeamsContextWithCredential object
 *
 * @beta
 */
export function useTeamsUserCredential(
  authConfig: TeamsUserCredentialAuthConfig
): TeamsContextWithCredential {
  const [result] = useTeams({});
  const { data, error, loading } = useData(async () => {
    if (process.env.NODE_ENV === "development") {
      setLogLevel(LogLevel.Verbose);
      setLogFunction((level: LogLevel, message: string) => {
        console.log(message);
      });
    }
    return new TeamsUserCredential(authConfig);
  });
  return { teamsUserCredential: data, error, loading, ...result };
}
