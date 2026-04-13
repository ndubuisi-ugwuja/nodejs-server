import passport from "passport";
import { Strategy } from "passport-local";

const mockUsers = [{id: 1, name: "Ndubuisi", username: "Ndu123", password: "123"}, {id: 2, name: "Jiovta", username: "Jio123", password: "1234"}, {id: 3, name: "Ugwuja", username: "Ugw123", password: "12345"},]

passport.use(
    new Strategy((username, password, done) => {
        try {
            const findUser = mockUsers.find((user) => user.username === username)
            if(!findUser) throw new Error("Bad credentials")
        } catch(err) {
            console.error(err)
        }
    })
)