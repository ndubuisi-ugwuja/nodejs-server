import express from "express";
import 'dotenv/config'

const app = express()

const {PORT} = process.env || 3000

app.get("/", (request, response) => {
    response.send("Hi, I got the request")
})

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
})