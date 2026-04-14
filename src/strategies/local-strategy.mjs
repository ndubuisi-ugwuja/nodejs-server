import passport from "passport";
import { Strategy } from "passport-local";
import { User } from "../mongoose/schema/user.mjs";

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    try {
        const findUser = mockUsers.find((user) => user.id === id)
        if(!findUser) throw new Error("Bad credentials")  
                
        done(null, findUser)
    } catch(err) {
        done(err, null)
    }
})

export default passport.use(
    new Strategy(async (username, password, done) => {
        try {
            const findUser = await User.findOne({username})
            if(!findUser) throw new Error("Bad credentials") 
                
            if(!findUser || findUser.password !== password) throw new Error("Bad credentials")  
                
            done(null, findUser)
        } catch(err) {
            done(err, null)
        }
    })
)