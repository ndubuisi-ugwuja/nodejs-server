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
    const parsedId = parseInt(request.params.id)
    console.log(parsedId)
    
    if(isNaN(parsedId)) return response.status(400).send({msg: "Id is not a number"})

    const findUser = mockUsers.find((user) => user.id === parsedId)

    if (!findUser) return response.status(404).send({msg: "User not found"})

    return response.status(200).send(findUser)
})

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
})