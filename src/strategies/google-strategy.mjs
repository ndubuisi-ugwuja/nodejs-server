import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import { googleUser } from "../mongoose/schemas/google-users.mjs";
import 'dotenv/config'

const {GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, CALLBACK_URL} = process.env

export default passport.use(

    new Strategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
        scope: ['profile', 'email']
    }, 
    async(accessToken, refreshToken, profile, done) => {
        let findUser;
        try {
            findUser = await googleUser.findOne({googleId: profile.id});
        } catch(err) {
            return done(err, null)
        };

        try{
            if(!findUser) {
                const newUser = new googleUser({
                    googleId: profile.id,
                    username: profile.displayName,
                    email: profile.emails[0].value
                });
                const savedUser = await newUser.save();
                return done(null, savedUser);
            }
            return done(null, findUser)
        } catch(err) {
            console.log(err)
            return done(err, null)
        };
    })
);