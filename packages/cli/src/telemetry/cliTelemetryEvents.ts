// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
"use strict";

export enum TelemetryEvent {
  //TODO: define CLI telemetry event
  AccountLoginStart = "login-start",
  AccountLogin = "login",

  CreateProjectStart = "create-project-start",
  CreateProject = "create-project",

  InitInfraStart = "init-infra-start",
  InitInfra = "init-infra",

  InitDebugStart = "init-debug-start",
  InitDebug = "init-debug",

  InitProjectStart = "init-project-start",
  InitProject = "init-project",

  DownloadSampleStart = "download-sample-start",
  DownloadSample = "download-sample",

  UpdateProjectStart = "add-resource-start",
  UpdateProject = "add-resource",

  AddCapStart = "add-capability-start",
  AddCap = "add-capability",

  ValidateManifestStart = "validate-manifest-start",
  ValidateManifest = "validate-manifest",

  UpdateManifestStart = "update-manifest-start",
  UpdateManifest = "update-manifest",

  BuildStart = "build-start",
  Build = "build",

  AddCICDStart = "add-cicd-start",
  AddCICD = "add-cicd",

  ConnectExistingApiStart = "connect-existing-api-start",
  ConnectExistingApi = "connect-existing-api",

  ProvisionStart = "provision-start",
  Provision = "provision",

  ProvisionManifestStart = "provision-manifest-start",
  ProvisionManifest = "provision-manifest",

  DeployStart = "deploy-start",
  Deploy = "deploy",
  DeployAad = "deployAad",

  PublishStart = "publish-start",
  Publish = "publish",

  Preview = "preview",
  PreviewNpmInstallStart = "preview-npm-install-start",
  PreviewNpmInstall = "preview-npm-install",
  PreviewGulpCert = "preview-gulp-cert",
  PreviewGulpCertStart = "preview-gulp-cert-start",
  PreviewServiceStart = "preview-service-start",
  PreviewService = "preview-service",
  PreviewSideloading = "preview-sideloading",
  PreviewSideloadingStart = "preview-sideloading-start",
  PreviewSPFxOpenBrowserStart = "preview-spfx-open-browser-start",
  PreviewSPFxOpenBrowser = "preview-spfx-open-browser",
  PreviewPrerequisites = "preview-prerequisites",
  PreviewPrereqsCheckNode = "preview-prereqs-check-node",
  PreviewPrereqsCheckM365Account = "preview-prereqs-check-m365-account",
  PreviewPrereqsCheckCert = "preview-prereqs-check-cert",
  PreviewPrereqsCheckDependencies = "preview-prereqs-check-dependencies",
  PreviewPrereqsCheckPorts = "preview-prereqs-check-ports",
  PreviewPrepareDevEnv = "preview-prepare-dev-env",
  PreviewStartServices = "preview-start-services",

  AutomaticNpmInstallStart = "automatic-npm-install-start",
  AutomaticNpmInstall = "automatic-npm-install",

  ConfigGet = "config-get",
  ConfigSet = "config-set",

  CheckPermissionStart = "check-permission-start",
  CheckPermission = "check-permission",

  GrantPermissionStart = "grant-permission-start",
  GrantPermission = "grant-permission",

  EnvListStart = "env-list-start",
  EnvList = "env-list",
  CreateNewEnvironmentStart = "create-new-environment-start",
  CreateNewEnvironment = "create-new-environment",

  AddSsoStart = "add-sso-start",
  AddSso = "add-sso",
}

export enum TelemetryProperty {
  Component = "component",
  ProjectId = "project-id",
  CorrelationId = "correlation-id",
  AppId = "appid",
  TenantId = "tenant-id",
  UserId = "hashed-userid",
  AccountType = "account-type",
  Success = "success",
  Duration = "duration",
  ErrorType = "error-type",
  ErrorCode = "error-code",
  ErrorMessage = "error-message",
  SampleName = "sample-app-name",
  Capabilities = "capabilities",
  Resources = "resources",
  Internal = "internal",
  InternalAlias = "internal-alias",
  PreviewAppId = "preview-appid",
  PreviewType = "preview-type",
  PreviewBrowser = "preview-browser",
  PreviewHub = "preview-hub",
  PreviewNpmInstallName = "preview-npm-install-name",
  PreviewGulpCertName = "preview-gulp-cert-name",
  PreviewNpmInstallExitCode = "preview-npm-install-exit-code",
  PreviewNpmInstallNodeVersion = "preview-npm-install-node-version",
  PreviewNpmInstallNpmVersion = "preview-npm-install-npm-version",
  PreviewNpmInstallErrorMessage = "preview-npm-install-error-message",
  PreviewServiceName = "preview-service-name",
  PreviewOSArch = "preview-os-arch",
  PreviewOSRelease = "preview-os-release",
  PreviewProjectComponents = "preview-project-components",
  PreviewCheckResults = "preview-check-results",
  PreviewPortsInUse = "preview-ports-in-use",
  PreviewDevCertStatus = "preview-dev-cert-status",
  ListAllCollaborators = "list-all-collaborators",
  FeatureFlags = "feature-flags",
  Env = "env",
  SettingsVersion = "settings-version",
  NewProjectId = "new-project-id",
  IsM365 = "is-m365",
  IsCreatingM365 = "is-creating-m365",
  IsFromSample = "is-from-sample",
  ProgrammingLanguage = "programming-language",
  HostType = "host-type",
}

export enum TelemetrySuccess {
  Yes = "yes",
  No = "no",
}

export enum TelemetryErrorType {
  UserError = "user",
  SystemError = "system",
}

export enum TelemetryAccountType {
  Azure = "azure",
  M365 = "m365",
}

export enum TelemetryPreviewDevCertStatus {
  Disabled = "disabled",
  AlreadyTrusted = "already-trusted",
  Trusted = "trusted",
  NotTrusted = "not-trusted",
}

export const TelemetryComponentType = "cli";
