import express from "express";
import 'dotenv/config'

const app = express()

const {PORT} = process.env || 3000

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
})