// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface InstallToolArgs {
  /**
   * trust local certificate
   */
  devCert?: DevCertArgs;

  /**
   * Install Azure Functions Core Tools
   */
  func?: boolean;
}

interface DevCertArgs {
  trust: boolean;
}
