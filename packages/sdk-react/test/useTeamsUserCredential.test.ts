// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react-hooks";
import * as useTeams from "../src/useTeams";
import * as useData from "../src/useData";
import { useTeamsUserCredential } from "../src/useTeamsUserCredential";
import { teamsTheme } from "@fluentui/react-northstar";
import { TeamsUserCredential, TeamsUserCredentialAuthConfig } from "@microsoft/teamsfx";
import * as teamsfxlib from "@microsoft/teamsfx";

describe("useTeamsUserCredential() hook tests", () => {
  let spyUseTeams: jest.SpyInstance;
  let spyUseData: jest.SpyInstance;
  const authConfig: TeamsUserCredentialAuthConfig = {
    clientId: "fake-client-id",
    initiateLoginEndpoint: "fake-initiate-login-endpoint",
  };

  beforeEach(() => {
    spyUseTeams = jest.spyOn(useTeams, "useTeams");
    spyUseTeams.mockImplementation(() => {
      return [
        { inTeams: true, theme: teamsTheme, themeString: "default" },
        { setTheme: (undefined) => {} },
      ];
    });
    spyUseData = jest.spyOn(useData, "useData");

    jest.spyOn(teamsfxlib, "TeamsUserCredential").mockImplementation((): TeamsUserCredential => {
      return {
        async login(): Promise<any> {},
        async getToken(): Promise<any> {},
        async getUserInfo(): Promise<any> {},
      };
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it("returns default teamsfx instance", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTeamsUserCredential(authConfig));
    expect(result.current.teamsUserCredential).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(result.current.loading).toBe(true);
    expect(result.current.inTeams).toBe(true);
    expect(result.current.themeString).toBe("default");

    await waitForNextUpdate();
    expect(result.current.error).toBeUndefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.inTeams).toBe(true);
    expect(result.current.themeString).toBe("default");
  });

  it("returns useData() error", async () => {
    spyUseData.mockImplementation(() => {
      return { error: "useData error", loading: false };
    });
    const { result } = renderHook(() => useTeamsUserCredential(authConfig));
    expect(result.current.teamsUserCredential).toBeUndefined;
    expect(result.current.error).toBe("useData error");
    expect(result.current.loading).toBe(false);
    expect(result.current.inTeams).toBe(true);
    expect(result.current.themeString).toBe("default");
  });
});
