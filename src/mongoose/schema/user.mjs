import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    name: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    username: {
        type: mongoose.Schema.Types.String,
        required: true
    }
})