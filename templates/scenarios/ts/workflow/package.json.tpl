{
    "name": "{%appName%}",
    "version": "1.0.0",
    "description": "Microsoft Teams Toolkit Workflow Bot Sample",
    "author": "Microsoft",
    "license": "MIT",
    "main": "./src/index.js",
    "scripts": {
        "dev": "nodemon --watch ./src --exec node --inspect=9239 --signal SIGINT -r ts-node/register ./src/index.ts",
        "build": "tsc --build && shx cp -r ./src/adaptiveCards ./lib/src",
        "start": "node ./lib/src/index.js",
        "watch": "nodemon --watch ./src --exec \"npm run start\"",
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "repository": {
        "type": "git",
        "url": "https://github.com"
    },
    "dependencies": {
        "@microsoft/adaptivecards-tools": "^1.0.0",
        "@microsoft/teamsfx": "^1.2.0",
        "restify": "^8.5.1"
    },
    "devDependencies": {
        "@types/restify": "8.4.2",
        "@microsoft/teamsfx-run-utils": "alpha",
        "nodemon": "^2.0.7",
        "shx": "^0.3.4",
        "ts-node": "^10.4.0",
        "typescript": "^4.4.4"
    }
}