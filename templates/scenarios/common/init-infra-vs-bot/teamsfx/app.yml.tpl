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
