import express, { request, response } from "express";
import 'dotenv/config'

const app = express()

// Middleware
app.use(express.json())

const loggingMiddleware = (request, response, next) => {
    console.log(request.method)
    next()
}

app.use(loggingMiddleware())

const {PORT} = process.env || 3000

const mockUsers = [{id: 1, name: "Ndubuisi", username: "Ndu123"}, {id: 2, name: "Jiovta", username: "Jio123"}, {id: 3, name: "Ugwuja", username: "Ugw123"},]

app.get("/", (request, response) => {
    response.status(200).send({msg: "This is the root directory"})
})

// Query parameters
app.get("/api/users", (request, response) => {
    console.log(request.query)
    const {query: {filter, value}} = request

    if(filter && value) return response.send(
        mockUsers.filter((user) => user[filter].includes(value))
    )

    return response.status(200).send(mockUsers)

    // Here when we visit the end point http://localhost:3000/api/users?filter=name&value=Nd, 
    // it filters by name and returns names that includes Nd
})

// Route parameter
app.get("/api/users/:id", (request, response) => {
    const parsedId = parseInt(request.params.id)
    console.log(parsedId)
    
    if(isNaN(parsedId)) return response.status(400).send({msg: "Id is not a number"})

    const findUser = mockUsers.find((user) => user.id === parsedId)

    if (!findUser) return response.status(404).send({msg: "User not found"})

    return response.status(200).send(findUser)
})

// Post Request
app.post("/api/users", (request, response) => {
    console.log(request.body)
    const { body } = request
    const newUser = {id: mockUsers.length + 1, ...body}
    mockUsers.push(newUser)
    console.log(mockUsers)    
    return response.status(201).send(newUser)
})                       

// Put Request
app.put("/api/users/:id", (request, response) => {
    console.log(request.body)
    const { body, params: {id} } = request
    const parsedId = parseInt(id)
    console.log(parsedId)
    
    if(isNaN(parsedId)) return response.status(400).send({msg: "Id is not a number"})

    const findUserIndex = mockUsers.findIndex((user) => user.id === parsedId)

    if (findUserIndex === -1) return response.status(404).send({msg: "User not found"})
    
    mockUsers[findUserIndex] = {id: parsedId, ...body}

    console.log(mockUsers)

    return response.status(200).send(mockUsers)
})

// Patch Request
app.patch("/api/users/:id", (request, response) => {
    console.log(request.body)
    const {body, params: {id}} = request

    const parsedId = parseInt(id)

    if(isNaN(parsedId)) return response.status(400).send({msg: "Id is not a number"})

    const findUserIndex = mockUsers.findIndex((user) => user.id === parsedId)

    if(findUserIndex === -1) return response.status(404).send({msg: "User not found"})

    mockUsers[findUserIndex] = {...mockUsers[findUserIndex], ...body}
    console.log(mockUsers)

    return response.status(200).send(mockUsers)
})

// Delete Request
app.delete("/api/users/:id", (request, response) => {
    const parsedId = parseInt(request.params.id)
    console.log(parsedId)

    if(isNaN(parsedId)) return response.status(400).send({msg: "Id is not a number"})

    const findUserIndex = mockUsers.findIndex((user) => user.id === parsedId)

    if(findUserIndex === -1) return response.status(404)

    mockUsers.splice(findUserIndex, 1)
    console.log(mockUsers)

    return response.status(200).send(mockUsers)   
})

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
})