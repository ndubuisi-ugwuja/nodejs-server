import express, { request, response } from "express";
import { query, validationResult, body } from "express-validator"
import 'dotenv/config'

const app = express()

// Middlewares
const resolveIndexByUserId = (request, response, next) => {
    const {params: {id}} = request

    const parsedId = parseInt(id)

    if(isNaN(parsedId)) return response.status(400).send({msg: "Id is not a number"})

    const findUserIndex = mockUsers.findIndex((user) => user.id === parsedId)

    if(findUserIndex === -1) return response.status(404).send({msg: "User not found"})
    request.findUserIndex = findUserIndex
    request.parsedId = parsedId
    next()
}

app.use(express.json())

const {PORT} = process.env || 3000

const mockUsers = [{id: 1, name: "Ndubuisi", username: "Ndu123"}, {id: 2, name: "Jiovta", username: "Jio123"}, {id: 3, name: "Ugwuja", username: "Ugw123"},]

app.get("/", (request, response) => {
    response.status(200).send({msg: "This is the root directory"})
})

// Query parameters
app.get("/api/users", query("filter").isString().withMessage("Must be a string").notEmpty().withMessage("Must not be empty").isLength({min: 3, max:10}).withMessage("Must be 3 - 10 chars"), (request, response) => {
    const result = validationResult(request)
    console.log(result)

    const {query: {filter, value}} = request

    if(filter && value) return response.send(
        mockUsers.filter((user) => user[filter].includes(value))
    )

    return response.status(200).send(mockUsers)

    // Here when we visit the end point http://localhost:3000/api/users?filter=name&value=Nd, 
    // it filters by name and returns names that includes Nd
})

// Route parameter
app.get("/api/users/:id", resolveIndexByUserId, (request, response) => {
    const {findUserIndex} = request
    const findUser = mockUsers[findUserIndex]

    console.log(findUser)

    return response.status(200).send(findUser)
})

// Post Request
app.post("/api/users", [
    body("name")
    .notEmpty()
    .withMessage("name cannot be empty")
    .isString()
    .withMessage("Must be a string"),
    body("username")
    .notEmpty()
    .withMessage("username cannot be empty")
    .isString()
    .withMessage("Must be a string")
]
    , (request, response) => {
    const result = validationResult(request)
    console.log(result)
    
    if(!result.isEmpty())
        return response.status(400).send({error: result.array()})

    console.log(request.body)
    const { body } = request
    const newUser = {id: mockUsers.length + 1, ...body}
    mockUsers.push(newUser)
    console.log(mockUsers)    
    return response.status(201).send(newUser)
})                       

// Put Request
app.put("/api/users/:id", [
    body("name")
    .notEmpty()
    .withMessage("name cannot be empty")
    .isString()
    .withMessage("Must be a string"),
    body("username")
    .notEmpty()
    .withMessage("username cannot be empty")
    .isString()
    .withMessage("Must be a string")
], resolveIndexByUserId, (request, response) => {
    const result = validationResult(request)
    if(!result.isEmpty())
        return response.status(400).send({error: result.array()})

    const {body, findUserIndex, parsedId} = request
    mockUsers[findUserIndex] = {id: parsedId, ...body}

    console.log(mockUsers)

    return response.status(200).send(mockUsers)
})

// Patch Request
app.patch("/api/users/:id", 
    body()
    .notEmpty()
    .withMessage("name cannot be empty")
    .isString()
    .withMessage("Must be a string"),resolveIndexByUserId, (request, response) => {
    const result = validationResult(request)

    if(!result.isEmpty())
        return response.status(400).send({error: result.array()})

    const {body, findUserIndex} = request
    mockUsers[findUserIndex] = {...mockUsers[findUserIndex], ...body}
    console.log(mockUsers)

    return response.status(200).send(mockUsers)
})

// Delete Request
app.delete("/api/users/:id", resolveIndexByUserId, (request, response) => {
    const {findUserIndex} = request
    mockUsers.splice(findUserIndex, 1)
    console.log(mockUsers)

    return response.status(200).send(mockUsers)   
})

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
})