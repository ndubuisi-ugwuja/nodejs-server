import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import { googleUser } from "../mongoose/schema/google-users.mjs";
import 'dotenv/config'

const {GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRETE, CALLBACK_URL} = process.env

export default passport.use(

    new Strategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRETE,
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

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async(id, done) => {
    try{
        const findUser = await googleUser.findById(id);
        if(!findUser) throw new Error('User not found');
        done(null, findUser)
    } catch (err) {
        done(err, null)
    }
});