import mongoose, { Schema } from "mongoose";

const googleUserSchema = mongoose.Schema({
    googleId: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    
    email: {
        type: String,
        required: true,
    }
});

export const googleUser = mongoose.model('googleUser', googleUserSchema);