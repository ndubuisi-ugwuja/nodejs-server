import { Router } from "express";

const router = Router()

router.get("/api/user", (request, response) => {
    console.log(request.params)

    response.status(200).send({msg: "This is the root directory from router"})
})