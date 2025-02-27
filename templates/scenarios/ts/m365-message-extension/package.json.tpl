{
  "name": "{%appName%}",
  "version": "1.0.0",
  "description": "Microsoft Teams Toolkit m365 message extension sample",
  "author": "Microsoft",
  "license": "MIT",
  "main": "./lib/index.js",
  "scripts": {
    "dev": "nodemon --exec node --inspect=9239 --signal SIGINT -r ts-node/register ./index.ts",
    "build": "tsc --build",
    "start": "node ./lib/index.js",
    "test": "echo \"Error: no test specified\" && exit 1",
    "watch": "nodemon --exec \"npm run start\""
  },
  "repository": {
    "type": "git",
    "url": "https://github.com"
  },
  "dependencies": {
    "botbuilder": "~4.14.0",
    "restify": "^8.5.1"
  },
  "devDependencies": {
    "@microsoft/teamsfx-run-utils": "alpha",
    "@types/restify": "8.4.2",
    "ts-node": "^10.4.0",
    "typescript": "^4.4.4",
    "nodemon": "^2.0.7",
    "shx": "^0.3.3"
  }
}