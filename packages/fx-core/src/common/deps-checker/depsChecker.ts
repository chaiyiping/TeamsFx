// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { DepsCheckerError } from "./depsError";

export interface DepsChecker {
  getInstallationInfo(installOptions?: InstallOptions): Promise<DependencyStatus>;

  resolve(installOptions?: InstallOptions): Promise<DependencyStatus>;
}

export type DependencyStatus = {
  name: string;
  type: DepsType;
  isInstalled: boolean;
  command: string;
  details: {
    isLinuxSupported: boolean;
    supportedVersions: string[];
    installVersion?: string;
    binFolders?: string[];
  };
  error?: DepsCheckerError;
};

export interface DepsInfo {
  name: string;
  isLinuxSupported: boolean;
  installVersion?: string;
  supportedVersions: string[];
  binFolders?: string[];
  details: Map<string, string>;
}

export enum DepsType {
  AzureNode = "azure-node",
  SpfxNode = "spfx-node",
  SpfxNodeV1_16 = "spfx-node-v-1-16",
  Dotnet = "dotnet",
  FuncCoreTools = "func-core-tools",
  Ngrok = "ngrok",
  VxTestApp = "vx-test-app", // TODO(aochengwang): maybe change app name
}

export interface BaseInstallOptions {
  projectPath?: string;
  version?: string;
}

export type InstallOptions = BaseInstallOptions;
