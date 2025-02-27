version: 1.0.0

provision:
  - uses: arm/deploy # Deploy given ARM templates parallelly.
    with:
      subscriptionId: ${{AZURE_SUBSCRIPTION_ID}} # The AZURE_SUBSCRIPTION_ID is a built-in environment variable. TeamsFx will ask you select one subscription if its value is empty. You're free to reference other environment varialbe here, but TeamsFx will not ask you to select subscription if it's empty in this case.
      resourceGroupName: ${{AZURE_RESOURCE_GROUP_NAME}} # The AZURE_RESOURCE_GROUP_NAME is a built-in environment variable. TeamsFx will ask you to select or create one resource group if its value is empty. You're free to reference other environment varialbe here, but TeamsFx will not ask you to select or create resource grouop if it's empty in this case.
      templates:
       - path: ./infra/azure.bicep # Relative path to teamsfx folder
         parameters: ./infra/azure.parameters.json # Relative path to teamsfx folder. Placeholders will be replaced with corresponding environment variable before ARM deployment.
         deploymentName: Create-resources-for-tab # Required when deploy ARM template
      bicepCliVersion: v0.9.1 # Teams Toolkit will download this bicep CLI version from github for you, will use bicep CLI in PATH if you remove this config.
    # Output: every bicep output will be persisted in current environment's .env file with certain naming conversion. Refer https://aka.ms/teamsfx-provision-arm#output for more details on the naming conversion rule.

  - uses: azureStorage/enableStaticWebsite
    with:
      storageResourceId: ${{TAB_AZURE_STORAGE_RESOURCE_ID}}
      indexPage: index.html
      errorPage: error.html
    # Output: N/A

deploy:
  - uses: npm/command # Run npm command
    with:
      args: install
  - uses: npm/command # Run npm command
    env:
      REACT_APP_CLIENT_ID: ${{AAD_APP_CLIENT_ID}}
      REACT_APP_START_LOGIN_PAGE_URL: ${{TAB_ENDPOINT}}/auth-start.html
    with:
      args: run build
  - uses: azureStorage/deploy # Deploy bits to Azure Storage Static Website
    with:
      distributionPath: ./build # Deploy base folder. This folder includes manifest files for AAD app and Teams app that should be ignored using the ignoreFile.
      ignoreFile: ./.appserviceIgnore # Can be changed to any ignore file location, leave blank will ignore nothing
      resourceId: ${{TAB_AZURE_STORAGE_RESOURCE_ID}} # The resource id of the cloud resource to be deployed to

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
  - uses: aadApp/update # Apply the AAD manifest to an existing AAD app. Will use the object id in manifest file to determine which AAD app to update.
    with:
      manifestTemplatePath: ./aad.manifest.template.json # Relative path to teamsfx folder. Environment variables in manifest will be replaced before apply to AAD app
      outputFilePath : ./build/aad.manifest.${{TEAMSFX_ENV}}.json
  # Output: following environment variable will be persisted in current environment's .env file.
  # AAD_APP_ACCESS_AS_USER_PERMISSION_ID: the id of access_as_user permission which is used to enable SSO

  - uses: teamsApp/validate
    with:
      manifestTemplatePath: ./appPackage/manifest.template.json # Path to manifest template
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

publish:
  - uses: teamsApp/validate
    with:
      manifestTemplatePath: ./appPackage/manifest.template.json # Path to manifest template
  - uses: teamsApp/createAppPackage
    with:
      manifestTemplatePath: ./appPackage/manifest.template.json # Path to manifest template
      outputZipPath: ./build/appPackage/appPackage.${{TEAMSFX_ENV}}.zip
      outputJsonPath: ./build/appPackage/manifest.${{TEAMSFX_ENV}}.json
  - uses: teamsApp/publishAppPackage # Publish the app to Teams app catalog
    with:
      appPackagePath: ./build/appPackage/appPackage.${{TEAMSFX_ENV}}.zip
  # Output: following environment variable will be persisted in current environment's .env file.
  # TEAMS_APP_PUBLISHED_APP_ID: app id in Teams tenant app catalog.