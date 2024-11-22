if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    username => users.find(user => user.username === username),
    id => users.find(user => user.id === id)
)

const users = []

app.set('view-engine', 'ts')
app.use(express.urlencoded({ extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.render('index.ts')
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ts')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ts')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email:  req.body.email,
            password: hashedPassword

        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

app.delete('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err)
        }

        res.redirect('/login')
    })
})

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}



app.listen(3000)