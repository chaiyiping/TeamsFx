{
    "$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.15/MicrosoftTeams.schema.json",
    "manifestVersion": "1.15",
    "version": "1.0.0",
    "id": "${{TEAMS_APP_ID}}",
    "packageName": "com.microsoft.teams.extension",
    "developer": {
        "name": "Teams App, Inc.",
        "websiteUrl": "${{TAB_ENDPOINT}}",
        "privacyUrl": "${{TAB_ENDPOINT}}/privacy",
        "termsOfUseUrl": "${{TAB_ENDPOINT}}/termsofuse"
    },
    "icons": {
        "color": "resources/color.png",
        "outline": "resources/outline.png"
    },
    "name": {
        "short": "{%appName%}",
        "full": "Full name for {%appName%}"
    },
    "description": {
        "short": "Short description of {%appName%}",
        "full": "Full description of {%appName%}"
    },
    "accentColor": "#FFFFFF",
    "bots": [],
    "composeExtensions": [],
    "configurableTabs": [
        {
            "configurationUrl": "${{TAB_ENDPOINT}}/config",
            "canUpdateConfiguration": true,
            "scopes": [
                "team",
                "groupchat"
            ]
        }
    ],
    "staticTabs": [
        {
            "entityId": "index",
            "name": "Personal Tab",
            "contentUrl": "${{TAB_ENDPOINT}}/tab",
            "websiteUrl": "${{TAB_ENDPOINT}}/tab",
            "scopes": [
                "personal"
            ]
        }
    ],
    "permissions": [
        "identity",
        "messageTeamMembers"
    ],
    "validDomains": [
        "${{TAB_DOMAIN}}"
    ]
}