import passport from "passport";
import { Strategy } from "passport-local";

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
    new Strategy((username, password, done) => {
        try {
            const findUser = mockUsers.find((user) => user.username === username)
            if(!findUser || findUser.password !== password) throw new Error("Bad credentials")  
                
            done(null, findUser)
        } catch(err) {
            done(err, null)
        }
    })
)