const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUsername, getUserById){
    const authenticateUser = async (username, password, done) => {
        const user = getUserbyUsername(username)
        if (user == null) {
            return done(null, false, {message: 'No user with that username'})
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done (null, user)
            } else {
                return done (null, false, {message: 'Password Incorrect'})
            }

        }  catch (e) {
            return done(e)
        }
    }

    passport.use(new LocalStrategy({username: 'username'}, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.desrializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}


module.exports = initialize