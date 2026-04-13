import passport from "passport";
import { Strategy } from "passport-local";

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser()

const mockUsers = [{id: 1, name: "Ndubuisi", username: "Ndu123", password: "123"}, {id: 2, name: "Jiovta", username: "Jio123", password: "1234"}, {id: 3, name: "Ugwuja", username: "Ugw123", password: "12345"},]

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