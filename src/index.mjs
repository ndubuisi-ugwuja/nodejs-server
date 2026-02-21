import express, { request, response } from "express";
import 'dotenv/config'

const app = express()

app.use(express.json())

const {PORT} = process.env || 3000

const mockUsers = [{id: 1, name: "Ndubuisi"}, {id: 2, name: "Jiovta"}, {id: 3, name: "Ugwuja"},]

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

    return response.status(201).send(mockUsers)

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

// Post request
app.post("/api/users", (request, response) => {
    console.log(request.body)
    return response.status(201).send({msg: "User created successfully"})
})                       

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
})