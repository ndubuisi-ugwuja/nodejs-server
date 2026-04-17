import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    username: {
        type: mongoose.Schema.Types.String,
        required: true,
        unique: true
    },
    password: {
        type: mongoose.Schema.Types.String,
        required: true
    }
})

export const User = mongoose.model("User", userSchema)