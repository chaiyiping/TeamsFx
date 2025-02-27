{
    "name": "{%appName%}",
    "version": "0.1.0",
    "private": true,
    "dependencies": {
        "@fluentui/react-northstar": "^0.62.0",
        "@microsoft/mgt-element": "^2.6.2",
        "@microsoft/mgt-react": "^2.6.2",
        "@microsoft/mgt-teamsfx-provider": "^2.6.2",
        "@microsoft/microsoft-graph-client": "^3.0.1",
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
        "@microsoft/teamsfx-run-utils": "alpha",
        "cross-env": "^7.0.3",
        "env-cmd": "^10.1.0"
    },
    "scripts": {
        "start": "cross-env GENERATE_SOURCEMAP=false react-scripts start",
        "install:teamsfx": "npm install",
        "build": "cross-env GENERATE_SOURCEMAP=false react-scripts build",
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