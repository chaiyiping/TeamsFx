version: 1.0.0

provision:
  - uses: botAadApp/create # Creates a new AAD app for Bot Registration.
    with:
      name: {%appName%}
    # Output: following environment variable will be persisted in current environment's .env file.
    # BOT_ID: the AAD app client id created for Bot Registration.
    # SECRET_BOT_PASSWORD: the AAD app client secret created for Bot Registration.

  - uses: arm/deploy # Deploy given ARM templates parallelly.
    with:
      subscriptionId: ${{AZURE_SUBSCRIPTION_ID}} # The AZURE_SUBSCRIPTION_ID is a built-in environment variable. TeamsFx will ask you select one subscription if its value is empty. You're free to reference other environment varialbe here, but TeamsFx will not ask you to select subscription if it's empty in this case.
      resourceGroupName: ${{AZURE_RESOURCE_GROUP_NAME}} # The AZURE_RESOURCE_GROUP_NAME is a built-in environment variable. TeamsFx will ask you to select or create one resource group if its value is empty. You're free to reference other environment varialbe here, but TeamsFx will not ask you to select or create resource grouop if it's empty in this case.
      templates:
      - path: ./infra/azure.bicep
        parameters: ./infra/azure.parameters.json
        deploymentName: Create-resources-for-bot
      bicepCliVersion: v0.9.1 # Teams Toolkit will download this bicep CLI version from github for you, will use bicep CLI in PATH if you remove this config.
    # Output: every bicep output will be persisted in current environment's .env file with certain naming conversion. Refer https://aka.ms/teamsfx-provision-arm#output for more details on the naming conversion rule.

deploy:
  - uses: npm/command
    with:
      args: install
  - uses: npm/command
    with:
      args: run build
  - uses: azureAppService/deploy # Deploy bits to Azure App Serivce
    with:
      distributionPath: . # Deploy base folder
      ignoreFile: ./.appserviceIgnore # Can be changed to any ignore file location, leave blank will ignore nothing
      resourceId: ${{BOT_AZURE_APP_SERVICE_RESOURCE_ID}} # The resource id of the cloud resource to be deployed to

registerApp:
  - uses: teamsApp/create # Creates a Teams app
    with:
      name: {%appName%} # Teams app name
    # Output: following environment variable will be persisted in current environment's .env file.
    # TEAMS_APP_ID: the id of Teams app

configureApp:
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
      appPackagePath: ./build/appPackage/appPackage.${{TEAMSFX_ENV}}.zip # Relative path to this file. This is the path for built zip file.
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