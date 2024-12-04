import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'forum',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;

async function testDbConnection() {
    try {
        const [rows] = await pool.query('SELECT 1');
        console.log('Database connected successfully:', rows);
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}

testDbConnection();