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
        response.status(200).send({msg: "Root url"})
    })

    app.listen(PORT, () => {
        console.log(`Running on port ${PORT}`)
    })
```

- Get request fetches data from our backend database
- Post request adds data to our database
- Put request updates the entire data field in our database
- Patch request updates part of our entire data field in our database

## Section cookies

Cookies are small piece of data a server sends to the client on HTTP request. They are basically used for session management. The client stores it and automatically sends it back with every future request to that same server. 

HTTP is stateless — every request is a blank slate. The server has no memory of who you are between requests. Cookies give the server a way to "tag" your browser so it can recognize you on the next visit.