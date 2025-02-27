version: 1.0.0

registerApp:
  - uses: aadApp/create # Creates a new AAD app to authenticate users if AAD_APP_CLIENT_ID environment variable is empty
    with:
      name: {%appName%}-aad # Note: when you run configure/aadApp, the AAD app name will be updated based on the definition of manifest. If you don't want to change the name, ensure the name in AAD manifest is same with the name defined here.
      generateClientSecret: true # If the value is false, the action will not generate client secret for you
    # Output: following environment variable will be persisted in current environment's .env file.
    # AAD_APP_CLIENT_ID: the client id of AAD app
    # AAD_APP_CLIENT_SECRET: the client secret of AAD app
    # AAD_APP_OBJECT_ID: the object id of AAD app
    # AAD_APP_TENANT_ID: the tenant id of AAD app
    # AAD_APP_OAUTH_AUTHORITY_HOST: the host of OAUTH authority of AAD app
    # AAD_APP_OAUTH_AUTHORITY: the OAUTH authority of AAD app

  - uses: teamsApp/create # Creates a Teams app
    with:
      name: {%appName%} # Teams app name
    # Output: following environment variable will be persisted in current environment's .env file.
    # TEAMS_APP_ID: the id of Teams app

configureApp:
  - uses: env/generate # Generate env to .env file
    with:
      envs:
        TAB_DOMAIN: localhost:44302
        TAB_ENDPOINT: https://localhost:44302

  - uses: appsettings/generate
    with:
      target: ./appsettings.Development.json
      appsettings:
        TeamsFx:
          Authentication:
            ClientId: ${{AAD_APP_CLIENT_ID}}
            ClientSecret: ${{SECRET_AAD_APP_CLIENT_SECRET}}
            OAuthAuthority: ${{AAD_APP_OAUTH_AUTHORITY}}

  - uses: aadApp/update # Apply the AAD manifest to an existing AAD app. Will use the object id in manifest file to determine which AAD app to update.
    with:
      manifestTemplatePath: ./aad.manifest.template.json # Relative path to teamsfx folder. Environment variables in manifest will be replaced before apply to AAD app
      outputFilePath : ./build/aad.manifest.${{TEAMSFX_ENV}}.json
  # Output: following environment variable will be persisted in current environment's .env file.
  # AAD_APP_ACCESS_AS_USER_PERMISSION_ID: the id of access_as_user permission which is used to enable SSO

  - uses: teamsApp/createAppPackage # Build Teams app package with latest env value
    with:
      manifestTemplatePath: ./appPackage/manifest.template.json # Path to manifest template
      outputZipPath: ./build/appPackage/appPackage.${{TEAMSFX_ENV}}.zip
      outputJsonPath: ./build/appPackage/manifest.${{TEAMSFX_ENV}}.json
  - uses: teamsApp/update # Apply the Teams app manifest to an existing Teams app. Will use the app id in manifest file to determine which Teams app to update.
    with:
      appPackagePath: ./build/appPackage/appPackage.${{TEAMSFX_ENV}}.zip # Relative path to teamsfx folder. This is the path for built zip file.
    # Output: following environment variable will be persisted in current environment's .env file.
    # TEAMS_APP_ID: the id of Teams app