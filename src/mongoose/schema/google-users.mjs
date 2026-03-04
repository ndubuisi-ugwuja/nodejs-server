import mongoose from "mongoose";

const googleUserSchema = mongoose.Schema({
    googleId: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    username: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    
    email: {
        type: mongoose.Schema.Types.String,
        required: true,
    }
});

export const googleUser = mongoose.model('googleUser', googleUserSchema);