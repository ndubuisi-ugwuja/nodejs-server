import express from "express";
import { query, validationResult, matchedData, checkSchema } from "express-validator"
import { createUserValidationSchema } from "./utils/validationSchemas.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import Passport from "passport";
import "./strategies/local-strategy.mjs"

import mongoose from "mongoose"
import { User } from "./mongoose/schema/user.mjs";
import 'dotenv/config'
import passport from "passport";

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(session({
    secret: "dxx13q",
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 60000 * 60, // 1 hour
    }
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb://localhost/express-backend")
    .then(() => console.log("Connected to Database"))
    .catch((err) => console.log("Error:", err))


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

const {PORT} = process.env || 3000

const mockUsers = [{id: 1, name: "Ndubuisi", username: "Ndu123", password: "123"}, {id: 2, name: "Jiovta", username: "Jio123", password: "1234"}, {id: 3, name: "Ugwuja", username: "Ugw123", password: "12345"},]

app.get("/", (request, response) => {
    request.session.visited = true
    console.log(request.session)
    console.log(request.session.id)
    request.sessionStore.get(request.session.id, (err, sessionData) => {
        if(err) {
            console.error(err)
            throw err
        }
        console.log(sessionData)
    })
    response.cookie("Test cookies", "base url cookie", {maxAge: 60000 * 60}) // expires in 1 min (unit in milliseconds)
    response.status(200).send({msg: "Root directory"})
})

// Query parameter
app.get("/api/users", query("filter").isString().withMessage("Must be a string").notEmpty().withMessage("Must not be empty").isLength({min: 3, max:10}).withMessage("Must be 3 - 10 chars"), (request, response) => {
    const result = validationResult(request)
    console.log(result)

    const {query: {filter, value}} = request

    if(filter && value) return response.send(
        mockUsers.filter((user) => user[filter].includes(value))
    )

    return response.status(200).send(mockUsers)
})

// Route parameter
app.get("/api/users/:id", resolveIndexByUserId, (request, response) => {
    const {findUserIndex} = request
    const findUser = mockUsers[findUserIndex]

    console.log(findUser)

    return response.status(200).send(findUser)
})

// Post Request
app.post("/api/users", checkSchema(createUserValidationSchema), async (request, response) => {
    const result = validationResult(request)
    console.log(result)
    
    if(!result.isEmpty())
        return response.status(400).send({error: result.array()})

    const data = matchedData(request)
    console.log(data)
    
    const newUser = new User(data)
    try {
        const savedUser = await newUser.save()
        return response.status(201).send(savedUser)
    } catch(err) {
        console.error("Error:", err)
        return response.sendStatus(400)
    }
})                       

// Put Request
app.put("/api/users/:id", resolveIndexByUserId, (request, response) => {
    const result = validationResult(request)
    if(!result.isEmpty())
        return response.status(400).send({error: result.array()})

    const data = matchedData(request)
    console.log(data)
    
    const {findUserIndex, parsedId} = request
    mockUsers[findUserIndex] = {id: parsedId, ...data}

    console.log(mockUsers)

    return response.status(200).send(mockUsers)
})

// Patch Request
app.patch("/api/users/:id", resolveIndexByUserId, (request, response) => {
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

// Authentication endpoint
app.post("/api/auth", passport.authenticate("local"), (request, response) => {
    
})

// Authentication status endpoint
app.get("/api/auth/status", (request, response) => {
    if(!request.session.user) return response.status(401).send({msg: "User not authenticated"})

    return response.status(200).send({msg: "User is authenticated"})
})

// Simple virtual cart system
app.post("/api/cart", (request, response) => {
    if(!request.session.user) return response.sendStatus(401)

    const {body: item} = request

    const {cart} = request.session

    if(cart) {
        cart.push(item)
    } else {
        request.session.cart = [item]
    }

    return response.status(201).send(item)
})

app.get("/api/cart", (request, response) => {
    if(!request.session.user) return response.sendStatus(401)

    return response.status(200).send(request.session.cart ?? [])
})

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
})