{
  "profiles": {
    "Microsoft Teams (browser)": {
      "commandName": "Project",
      "dotnetRunMessages": "true",
      "launchBrowser": true,
      "launchUrl": "https://teams.microsoft.com/l/app/%TEAMSAPPID%?installAppPackage=true&webjoin=true&appTenantId=%TENANTID%&login_hint=%USERNAME%",
      "applicationUrl": "http://localhost:5130",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      },
      "hotReloadProfile": "aspnetcore"
    }
    //// Uncomment following profile to debug project only (without launching Teams)
    //,
    //"{%ProjectName%}": {
    //  "commandName": "Project",
    //  "dotnetRunMessages": "true",
    //  "applicationUrl": "https://localhost:7130;http://localhost:5130",
    //  "environmentVariables": {
    //    "ASPNETCORE_ENVIRONMENT": "Development"
    //  },
    //  "hotReloadProfile": "aspnetcore"
    //}
  }
}
