// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IBot, IComposeExtension, IConfigurableTab, IStaticTab } from "@microsoft/teamsfx-api";
import { getLocalizedString } from "../../../common/localizeUtils";
import { ComponentNames } from "../../constants";

const AAD_STATE_KEY = ComponentNames.AadApp;
const TAB_STATE_KEY = ComponentNames.TeamsTab;
const BOT_STATE_KEY = ComponentNames.TeamsBot;
const APP_MANIFEST_KEY = ComponentNames.AppManifest;

export const TEAMS_APP_MANIFEST_TEMPLATE = `{
  "$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.14/MicrosoftTeams.schema.json",
  "manifestVersion": "1.14",
  "version": "1.0.0",
  "id": "{{state.${APP_MANIFEST_KEY}.teamsAppId}}",
  "packageName": "com.microsoft.teams.extension",
  "developer": {
      "name": "Teams App, Inc.",
      "websiteUrl": "{{{state.${TAB_STATE_KEY}.endpoint}}}",
      "privacyUrl": "{{{state.${TAB_STATE_KEY}.endpoint}}}{{{state.${TAB_STATE_KEY}.indexPath}}}/privacy",
      "termsOfUseUrl": "{{{state.${TAB_STATE_KEY}.endpoint}}}{{{state.${TAB_STATE_KEY}.indexPath}}}/termsofuse"
  },
  "icons": {
      "color": "{{config.manifest.icons.color}}",
      "outline": "{{config.manifest.icons.outline}}"
  },
  "name": {
      "short": "{{config.manifest.appName.short}}",
      "full": "{{config.manifest.appName.full}}"
  },
  "description": {
      "short": "{{config.manifest.description.short}}",
      "full": "{{config.manifest.description.full}}"
  },
  "accentColor": "#FFFFFF",
  "bots": [],
  "composeExtensions": [],
  "configurableTabs": [],
  "staticTabs": [],
  "permissions": [
      "identity",
      "messageTeamMembers"
  ],
  "validDomains": []
}`;

export const STATIC_TABS_TPL_V3: IStaticTab[] = [
  {
    entityId: "index",
    name: "Personal Tab",
    contentUrl: `{{{state.${TAB_STATE_KEY}.endpoint}}}{{{state.${TAB_STATE_KEY}.indexPath}}}/tab`,
    websiteUrl: `{{{state.${TAB_STATE_KEY}.endpoint}}}{{{state.${TAB_STATE_KEY}.indexPath}}}/tab`,
    scopes: ["personal"],
  },
];

export const CONFIGURABLE_TABS_TPL_V3: IConfigurableTab[] = [
  {
    configurationUrl: `{{{state.${TAB_STATE_KEY}.endpoint}}}{{{state.${TAB_STATE_KEY}.indexPath}}}/config`,
    canUpdateConfiguration: true,
    scopes: ["team", "groupchat"],
  },
];

export const BOT_ID_PLACEHOLDER = `{{state.${BOT_STATE_KEY}.botId}}`;

export const BOTS_TPL_FOR_COMMAND_AND_RESPONSE_V3: IBot[] = [
  {
    botId: BOT_ID_PLACEHOLDER,
    scopes: ["personal", "team", "groupchat"],
    supportsFiles: false,
    isNotificationOnly: false,
    commandLists: [
      {
        scopes: ["personal", "team", "groupchat"],
        commands: [
          {
            title: "helloWorld",
            description: "A helloworld command to send a welcome message",
          },
        ],
      },
    ],
  },
];

export const BOTS_TPL_FOR_NOTIFICATION_V3: IBot[] = [
  {
    botId: BOT_ID_PLACEHOLDER,
    scopes: ["personal", "team", "groupchat"],
    supportsFiles: false,
    isNotificationOnly: false,
  },
];

export const BOTS_TPL_V3: IBot[] = [
  {
    botId: BOT_ID_PLACEHOLDER,
    scopes: ["personal", "team", "groupchat"],
    supportsFiles: false,
    isNotificationOnly: false,
    commandLists: [
      {
        scopes: ["personal", "team", "groupchat"],
        commands: [
          {
            title: "welcome",
            description: "Resend welcome card of this Bot",
          },
          {
            title: "learn",
            description: "Learn about Adaptive Card and Bot Command",
          },
        ],
      },
    ],
  },
];
export const COMPOSE_EXTENSIONS_TPL_M365_V3: IComposeExtension[] = [
  {
    botId: BOT_ID_PLACEHOLDER,
    commands: [
      {
        id: "searchQuery",
        context: ["compose", "commandBox"],
        description: "Test command to run query",
        title: "Search",
        type: "query",
        parameters: [
          {
            name: "searchQuery",
            title: "Search Query",
            description: "Your search query",
            inputType: "text",
          },
        ],
      },
    ],
  },
];
export const COMPOSE_EXTENSIONS_TPL_V3: IComposeExtension[] = [
  {
    botId: BOT_ID_PLACEHOLDER,
    commands: [
      {
        id: "createCard",
        context: ["compose"],
        description: "Command to run action to create a Card from Compose Box",
        title: "Create Card",
        type: "action",
        parameters: [
          {
            name: "title",
            title: "Card title",
            description: "Title for the card",
            inputType: "text",
          },
          {
            name: "subTitle",
            title: "Subtitle",
            description: "Subtitle for the card",
            inputType: "text",
          },
          {
            name: "text",
            title: "Text",
            description: "Text for the card",
            inputType: "textarea",
          },
        ],
      },
      {
        id: "shareMessage",
        context: ["message"],
        description: "Test command to run action on message context (message sharing)",
        title: "Share Message",
        type: "action",
        parameters: [
          {
            name: "includeImage",
            title: "Include Image",
            description: "Include image in Hero Card",
            inputType: "toggle",
          },
        ],
      },
      {
        id: "searchQuery",
        context: ["compose", "commandBox"],
        description: "Test command to run query",
        title: "Search",
        type: "query",
        parameters: [
          {
            name: "searchQuery",
            title: "Search Query",
            description: "Your search query",
            inputType: "text",
          },
        ],
      },
    ],
    messageHandlers: [
      {
        type: "link",
        value: {
          domains: ["*.botframework.com"],
        },
      },
    ],
  },
];

export const WEB_APPLICATION_INFO_V3 = {
  id: `{{state.${AAD_STATE_KEY}.clientId}}`,
  resource: `{{{state.${AAD_STATE_KEY}.applicationIdUris}}}`,
};

export function getAppStudioEndpoint(): string {
  if (process.env.APP_STUDIO_ENV && process.env.APP_STUDIO_ENV === "int") {
    return "https://dev-int.teams.microsoft.com";
  } else {
    return "https://dev.teams.microsoft.com";
  }
}

export const AppStudioScopes = [`${getAppStudioEndpoint()}/AppDefinitions.ReadWrite`];

export class Constants {
  public static readonly MANIFEST_FILE = "manifest.json";
  public static readonly PLUGIN_NAME = "AppStudioPlugin";
  public static readonly BUILD_OR_PUBLISH_QUESTION = "build-or-publish";
  public static readonly INCLUDE_APP_MANIFEST = "include-app-manifest";
  public static readonly READ_MORE = getLocalizedString("core.Notification.ReadMore");
  public static readonly VIEW_DEVELOPER_PORTAL = getLocalizedString(
    "plugins.appstudio.viewDeveloperPortal"
  );
  public static readonly DEVELOPER_PORTAL_APP_PACKAGE_URL =
    "https://dev.teams.microsoft.com/apps/%s/app-package";
  public static readonly PUBLISH_GUIDE = "https://aka.ms/teamsfx-publish";
  public static readonly TEAMS_ADMIN_PORTAL = "https://aka.ms/teamsfx-mtac";
  public static readonly TEAMS_MANAGE_APP_DOC = "https://aka.ms/teamsfx-mtac-doc";
  public static readonly TEAMS_APP_ID = "teamsAppId";
  public static readonly TEAMS_APP_UPDATED_AT = "teamsAppUpdatedAt";

  public static readonly PERMISSIONS = {
    name: "Teams App",
    noPermission: "No permission",
    admin: "Administrator",
    operative: "Operative",
    type: "M365",
  };

  // HTTP headers are case insensitive. Axios lowercases all headers.
  public static readonly CORRELATION_ID = "x-correlation-id";
}

export class ErrorMessages {
  static readonly GetConfigError = (configName: string, plugin: string) =>
    `Failed to get configuration value "${configName}" for ${plugin}.`;
  static readonly GrantPermissionFailed = "Response is empty or user is not added.";
  static readonly TeamsAppNotFound = (teamsAppId: string) =>
    `Cannot find Teams App with id: ${teamsAppId}. Maybe your current M365 account doesn't not have permission, or the Teams App has already been deleted.`;
}

export class APP_STUDIO_API_NAMES {
  public static readonly CREATE_APP = "create-app";
  public static readonly GET_APP = "get-app";
  public static readonly PUBLISH_APP = "publish-app";
  public static readonly GET_PUBLISHED_APP = "get-published-app";
  public static readonly UPDATE_PUBLISHED_APP = "update-published-app";
  public static readonly UPDATE_OWNER = "update-owner";
  public static readonly EXISTS_IN_TENANTS = "exists-in-tenant";
  public static readonly GET_APP_PACKAGE = "get-app-package";
}

/**
 * Config keys that are useful for generating remote teams app manifest
 */
export const REMOTE_MANIFEST = "manifest.source.json";
export const MANIFEST_TEMPLATE = "manifest.remote.template.json";
export const MANIFEST_LOCAL = "manifest.local.template.json";
export const MANIFEST_TEMPLATE_CONSOLIDATE = "manifest.template.json";
export const FRONTEND_ENDPOINT = "endpoint";
export const FRONTEND_DOMAIN = "domain";
export const FRONTEND_INDEX_PATH = "indexPath";
export const BOT_ID = "botId";
export const LOCAL_BOT_ID = "localBotId";
export const COLOR_TEMPLATE = "plugins/resource/appstudio/defaultIcon.png";
export const OUTLINE_TEMPLATE = "plugins/resource/appstudio/defaultOutline.png";
export const DEFAULT_COLOR_PNG_FILENAME = "color.png";
export const DEFAULT_OUTLINE_PNG_FILENAME = "outline.png";
export const MANIFEST_RESOURCES = "resources";

// Default values for the developer fields in manifest.
export const DEFAULT_DEVELOPER = {
  name: "Teams App, Inc.",
  websiteUrl: "https://www.example.com",
  privacyUrl: "https://www.example.com/termofuse",
  termsOfUseUrl: "https://www.example.com/privacy",
};

export const BOTS_TPL_EXISTING_APP: IBot[] = [
  {
    botId: "{{config.manifest.botId}}",
    scopes: ["personal", "team", "groupchat"],
    supportsFiles: false,
    isNotificationOnly: false,
    commandLists: [
      {
        scopes: ["personal", "team", "groupchat"],
        commands: [],
      },
    ],
  },
];

export const COMPOSE_EXTENSIONS_TPL_EXISTING_APP: IComposeExtension[] = [
  {
    botId: "{{config.manifest.botId}}",
    commands: [],
    messageHandlers: [
      {
        type: "link",
        value: {
          domains: ["*.botframework.com"],
        },
      },
    ],
  },
];

export const CONFIGURABLE_TABS_TPL_EXISTING_APP: IConfigurableTab[] = [
  {
    configurationUrl: "{{config.manifest.tabConfigurationUrl}}",
    canUpdateConfiguration: true,
    scopes: ["team", "groupchat"],
  },
];

export const STATIC_TABS_TPL_EXISTING_APP: IStaticTab[] = [
  {
    entityId: "index",
    name: "Personal Tab",
    contentUrl: "{{config.manifest.tabContentUrl}}",
    websiteUrl: "{{config.manifest.tabWebsiteUrl}}",
    scopes: ["personal"],
  },
];

export const TEAMS_APP_SHORT_NAME_MAX_LENGTH = 30;
export const STATIC_TABS_MAX_ITEMS = 16;

/**
 * Config Keys that are useful for remote collaboration
 */
export const SOLUTION = "solution";
export const SOLUTION_USERINFO = "userinfo";

/**
 * Language codes.
 */
export const supportedLanguageCodes = [
  "ar-sa",
  "cs-cz",
  "da-dk",
  "de-at",
  "de-ch",
  "de-de",
  "de-li",
  "de-lu",
  "en-029",
  "en-au",
  "en-bz",
  "en-ca",
  "en-gb",
  "en-ie",
  "en-in",
  "en-jm",
  "en-my",
  "en-nz",
  "en-ph",
  "en-sg",
  "en-tt",
  "en-us",
  "en-za",
  "en-zw",
  "es-ar",
  "es-bo",
  "es-cl",
  "es-co",
  "es-cr",
  "es-do",
  "es-ec",
  "es-es",
  "es-gt",
  "es-hn",
  "es-mx",
  "es-ni",
  "es-pa",
  "es-pe",
  "es-pr",
  "es-py",
  "es-sv",
  "es-us",
  "es-uy",
  "es-ve",
  "fi-fi",
  "fr-be",
  "he-il",
  "hi-in",
  "fr-ca",
  "fr-ch",
  "fr-fr",
  "fr-lu",
  "fr-mc",
  "it-ch",
  "it-it",
  "ja-jp",
  "ko-kr",
  "nb-no",
  "nn-no",
  "nl-be",
  "nl-nl",
  "fil-ph",
  "pl-pl",
  "sk-sk",
  "hu-hu",
  "el-gr",
  "uk-ua",
  "pseudo",
  "fl-ip",
  "pt-br",
  "pt-pt",
  "ru-ru",
  "sv-fi",
  "sv-se",
  "tr-tr",
  "zh-cn",
  "zh-sg",
  "zh-hk",
  "zh-mo",
  "zh-tw",
  "th-th",
  "id-id",
  "ro-ro",
  "vi-vn",
  "lt-lt",
  "sl-si",
  "ca-es",
  "hr-hr",
  "et-ee",
  "bg-bg",
  "cy-gb",
  "is-is",
  "sr-latn-rs",
  "lv-lv",
  "ar",
  "cs",
  "da",
  "de",
  "en",
  "es",
  "fi",
  "fr",
  "he",
  "hi",
  "it",
  "ja",
  "ko",
  "nb",
  "nn",
  "nl",
  "fil",
  "pl",
  "sk",
  "hu",
  "el",
  "uk",
  "pseudo",
  "fl",
  "pt",
  "ru",
  "sv",
  "tr",
  "zh",
  "th",
  "id",
  "ro",
  "vi",
  "lt",
  "sl",
  "ca",
  "hr",
  "et",
  "bg",
  "cy",
  "is",
  "sr",
  "lv",
];
