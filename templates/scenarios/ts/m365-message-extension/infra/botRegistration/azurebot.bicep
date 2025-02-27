@maxLength(20)
@minLength(4)
@description('Used to generate names for all resources in this file')
param resourceBaseName string

param botServiceName string = resourceBaseName
param botServiceSku string = 'F0'
param botDisplayName string = resourceBaseName
param botAadAppClientId string
param botAppDomain string

// Register your web service as a bot with the Bot Framework
resource botService 'Microsoft.BotService/botServices@2021-03-01' = {
  kind: 'azurebot'
  location: 'global'
  name: botServiceName
  properties: {
    displayName: botDisplayName
    endpoint: 'https://${botAppDomain}/api/messages'
    msaAppId: botAadAppClientId
  }
  sku: {
    name: botServiceSku
  }
}

// Connect the bot service to Microsoft Teams
resource botServiceMsTeamsChannel 'Microsoft.BotService/botServices/channels@2021-03-01' = {
  parent: botService
  location: 'global'
  name: 'MsTeamsChannel'
  properties: {
    channelName: 'MsTeamsChannel'
  }
}

// Connect the bot service to Outlook
resource botServiceOutlookChannel 'Microsoft.BotService/botServices/channels@2022-06-15-preview' = {
  parent: botService
  location: 'global'
  name: 'OutlookChannel'
  properties: {
    channelName: 'OutlookChannel'
  }
}
