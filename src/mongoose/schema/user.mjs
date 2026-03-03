import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    name: mongoose.Schema.Types.String,
    username: mongoose.Schema.Types.String
})