import express from "express";
import 'dotenv/config'

const app = express()

const {PORT} = process.env || 3000

const mockUsers = [{id: 1, name: "Ndubuisi"}, {id: 2, name: "Jiovta"}, {id: 1, name: "Ugwuja"},]

app.get("/", (request, response) => {
    response.status(201).send({msg: "Got it"})
})

app.get("/api/users", (request, response) => {
    response.status(201).send(mockUsers)
})

app.get("/api/users/:id", (request, response) => {
    console.log(request.params)
    response.sendStatus(200)
})

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
})