{
    "name": "{%appName%}",
    "version": "0.1.0",
    "private": true,
    "dependencies": {
        "@fluentui/react-northstar": "^0.62.0",
        "@microsoft/teams-js": "^2.2.0",
        "@microsoft/teamsfx": "^2.0.0",
        "@microsoft/teamsfx-react": "^2.0.0",
        "axios": "^0.21.1",
        "react": "^16.14.0",
        "react-dom": "^16.14.0",
        "react-router-dom": "^5.1.2",
        "react-scripts": "^5.0.1"
    },
    "devDependencies": {
        "cross-env": "^7.0.3",
        "@microsoft/teamsfx-run-utils": "alpha"
    },
    "scripts": {
        "start": "react-scripts start",
        "install:teamsfx": "npm install",
        "build": "react-scripts build",
        "build:teamsfx": "cross-env-shell \"env-cmd -f .env.teamsfx.${TEAMS_FX_ENV} npm run build\"",
        "build:teamsfx:dev": "cross-env TEAMS_FX_ENV=dev npm run build:teamsfx",
        "eject": "react-scripts eject",
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "eslintConfig": {
        "extends": [
            "react-app",
            "react-app/jest"
        ]
    },
    "browserslist": {
        "production": [
            ">0.2%",
            "not dead",
            "not op_mini all"
        ],
        "development": [
            "last 1 chrome version",
            "last 1 firefox version",
            "last 1 safari version"
        ]
    },
    "homepage": "."
}