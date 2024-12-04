import { PassportStatic } from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import pool from './db';
import bcrypt from 'bcrypt';

function initialize(passport: PassportStatic, p0: unknown, p1: unknown) {
    const authenticateUser = async (username: string, password: string, done: Function) => {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
            const user = (rows as any[])[0];

            if (!user) {
                return done(null, false, { message: 'No user with that username' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (error) {
            return done(error);
        }
    };

    passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser));
    passport.serializeUser((user: any, done) => done(null, user.id));
    passport.deserializeUser(async (id: number, done) => {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
            const user = (rows as any[])[0];
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    });
}

export default initialize;