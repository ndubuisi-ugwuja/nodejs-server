import express from "express";
import { query, validationResult, matchedData, checkSchema } from "express-validator"
import { createUserValidationSchema } from "./utils/validationSchemas.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import "./strategies/local-strategy.mjs"
import "./strategies/google-strategy.mjs"
import mongoose from "mongoose"
import MongoStore from "connect-mongo";
import { User } from "./mongoose/schemas/user.mjs";
import { hashPassword } from "./utils/helpers.mjs";
import 'dotenv/config'

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(session({
    secret: "dxx13q",
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 60000 * 60, // 1 hour
    },
    store: MongoStore.create({
         mongoUrl: "mongodb://localhost/express-backend"
    })
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb://localhost/express-backend")
    .then(() => console.log("Connected to Database"))
    .catch((err) => console.log("Error:", err))

const {PORT} = process.env || 3000

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
app.get("/api/users", query("filter").isString().withMessage("Must be a string").notEmpty().withMessage("Must not be empty").isLength({min: 3, max:10}).withMessage("Must be 3 - 10 chars"), async (request, response) => {
    const result = validationResult(request)
    console.log(result)

    const { query: { filter, value } } = request

    if (filter && value) {
        const filteredUsers = await User.find({ [filter]: { $regex: value, $options: "i" } })
        return response.status(200).send(filteredUsers)
    }

    const allUsers = await User.find()
    return response.status(200).send(allUsers)
})

// Route parameter
app.get("/api/users/:username", async (request, response) => {
    const {params: {username}} = request
    const findUser = await User.findOne({username})

    console.log(findUser)

    return response.status(200).send(findUser)
})

// Post Request
app.post("/api/users", checkSchema(createUserValidationSchema), async (request, response) => {
    const result = validationResult(request)
    
    if(!result.isEmpty())
        return response.status(400).send({error: result.array()})

    const data = matchedData(request)

    data.password = hashPassword(data.password)
    
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
app.put("/api/users/:username", checkSchema(createUserValidationSchema), async (request, response) => {
    const result = validationResult(request)
    if(!result.isEmpty())
        return response.status(400).send({error: result.array()})


    const { params: {username} } = request
    const data = matchedData(request, { locations: ["body"] })

    data.password = hashPassword(data.password)

    try {
        const updatedUser = await User.findOneAndReplace(
            { username },
            data,
            { new: true }
        )

        if (!updatedUser) return response.status(404).json({ message: "User not found" })
        return response.status(200).json(updatedUser)
    } catch (error) {
        return response.status(500).json({ message: "Internal server error" })
    }
})

// Patch Request
app.patch("/api/users/:username", async (request, response) => {
    const { params: {username} } = request

    request.body.password = hashPassword(request.body.password)

    const updatedUser = await User.findOneAndUpdate(
        { username },
        { $set: request.body },
        { new: true }
    )

    if (!updatedUser) return response.status(404).json({ message: "User not found" })

    return response.status(200).json(updatedUser)
})

// Delete Request
app.delete("/api/users/:username", async (request, response) => {
    const { params: {username} } = request
    const deletedUser = await User.findOneAndDelete({ username })

    if (!deletedUser) return response.status(404).json({ message: "User not found" })

    return response.status(200).json({ message: "User deleted successfully" })   
})

// Local authentication endpoint
app.post("/api/auth", passport.authenticate("local"), (request, response) => {
    response.status(200).send({msg: "Logging success"})
})

// Google authentication endpoint
app.get("/api/auth/google", passport.authenticate('google'), (request, response) => {
    response.sendStatus(200);
});

// Google authentication redirect endpoint
app.get("/api/auth/google/redirect", passport.authenticate('google'), (request, response) => {
    return response.status(200).send('Logged in successfully')
});

// Authentication status endpoint
app.get("/api/auth/status", (request, response) => {
    if(!request.user) return response.status(401).send({msg: "User not authenticated"})

    return response.status(200).send({msg: "User is authenticated"})
})

// Logout endpoint
app.post("/api/auth/logout", (request, response) => {
    if(!request.user) return response.status(401).send({msg: "User not authenticated"})
    
    request.logout((err) => {
        if(err) return response.sendStatus(400)
        response.sendStatus(200)
    })
})

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
})