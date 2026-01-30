#  NodeJS Server (Revised)

**Setting up a NodeJS project**

- run npm init -y : This initializes your project with a package.json file
- add essential packages : npm i express express-session express-validator passport passport-google-oauth20 passport-local mongoose connect-mongo cookie-parser bcrypt
- add essential dev dependencies: npm i -D nodemon jest prettier
- configure dev tools: 
```package.json
    "start": "node ./src/index.js",
    "start:dev": "nodemon ./src/index.js" 
```
    