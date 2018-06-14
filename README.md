# chain3_restify - provides restapi service over chain3.js

## api and simple MOAC explorer using chain3 websocket koa nunjunks and vuejs

## Progress
  - The tool is good for test now

## Requirements
  - chain3.js for moac access
  - nodejs of recent versions
  
## Tested on
  - ubuntu 16.04
  - ubuntu 18.04 (best)
  - macosx
  
## Steps
  0. update config.js, have moac running with --rpc option
  1. install node.js
  2. fork, clone the repository
  3. test
    * npm install
    * open two terminals
      * start web service with websocket
        * node app.js
      * pull and feed data to websocket
        * node feed-ws.js
    * browse to http://localhost:3003
  4. deploy
    * customeize config.js 
    * deploy behind a proxy
  5. production
    * you can have separate /api and /ws to offload a single unit
    * you can cluster multiple units behind haproxy balancer
