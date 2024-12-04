if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import session from 'express-session';
import pool from './db';  // Import the pool for DB interaction
import initializePassport from './passport-config';

const app = express();

interface RegisterRequestBody {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
}

interface User {
    id: string;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
}

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Initialize Passport with database functions
initializePassport(
    passport,
    (username: string) => pool.query('SELECT * FROM users WHERE username = ?', [username]),
    (id: string) => pool.query('SELECT * FROM users WHERE id = ?', [id])
);

app.get('/', (req: Request, res: Response) => {
    res.render('index.ejs');
});

app.get('/login', checkNotAuthenticated, (req: Request, res: Response) => {
    res.render('login.ejs');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req: Request, res: Response) => {
    res.render('register.ejs');
});

app.post('/register', checkNotAuthenticated, async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
    const { username, firstname, lastname, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (username, firstname, lastname, email, password) VALUES (?, ?, ?, ?, ?)',
            [username, firstname, lastname, email, hashedPassword]
        );
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.redirect('/register');
    }
});

app.post('/logout', (req: Request, res: Response) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/login');
    });
});

function checkNotAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
