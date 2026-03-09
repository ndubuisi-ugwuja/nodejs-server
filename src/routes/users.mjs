import { Router } from "express";

const router = Router()

router.get("/api/user", (request, response) => {
    console.log(request.params)

    return response.status(200)
})