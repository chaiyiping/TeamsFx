{
  "name": "{%appName%}",
  "version": "1.0.0",
  "msteams": {
    "teamsAppId": null
  },
  "description": "Microsoft Teams Toolkit hello world Bot sample",
  "author": "Microsoft",
  "license": "MIT",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon --inspect=9239 --signal SIGINT ./index.js",
    "start": "node ./index.js",
    "watch": "nodemon ./index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "@microsoft/adaptivecards-tools": "^1.0.0",
    "botbuilder": "^4.18.0",
    "isomorphic-fetch": "^3.0.0",
    "restify": "~8.5.1"
  },
  "devDependencies": {
    "@microsoft/teamsfx-run-utils": "alpha",
    "nodemon": "^2.0.7"
  }
}
