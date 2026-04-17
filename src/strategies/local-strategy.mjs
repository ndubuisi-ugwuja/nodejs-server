import passport from "passport";
import { Strategy } from "passport-local";
import { User } from "../mongoose/schemas/user.mjs";
import { comparePassword } from "../utils/helpers.mjs";

export default passport.use(
    new Strategy(async (username, password, done) => {
        try {
            const findUser = await User.findOne({username})
            if(!findUser) throw new Error("Bad credentials")  

            if(!comparePassword(password, findUser.password)) throw new Error("Wrong password") 
                
            done(null, findUser)
        } catch(err) {
            done(err, null)
        }
    })
)