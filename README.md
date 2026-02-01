# NodeJS Server (Revised)

**Setting up a NodeJS project**

- run npm init -y : This initializes your project with a package.json file
- add essential packages : npm i express express-session express-validator passport passport-google-oauth20 passport-local mongoose connect-mongo cookie-parser bcrypt dotenv
- add essential dev dependencies: npm i -D nodemon jest prettier
- configure dev tools:

```package.json
    "start": "node ./src/index.mjs",
    "start:dev": "nodemon ./src/index.mjs",
    "format": "prettier --write ."
```
- simple express app
```JavaScript
    import express from "express";
    import 'dotenv/config'

    const app = express()

    const {PORT} = process.env || 3000

    app.get("/", (request, response) => {
        response.status(200).send({msg: "This is the root url"})
    })

    app.listen(PORT, () => {
        console.log(`Running on port ${PORT}`)
    })
```

