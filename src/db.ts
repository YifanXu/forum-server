import { Request, Response, NextFunction } from 'express';
// import mysql, { FieldInfo, MysqlError } from 'mysql'
import mysql from 'mysql2/promise'

var pool: mysql.Pool

export function initDB() {
	pool = mysql.createPool({
		connectionLimit: 10,
		host     : process.env.DB_HOST,
		user     : process.env.DB_USER,
		password : process.env.DB_SECRET,
		database : process.env.DB_SCHEMA
	});
}

export async function db_middleware (req: Request, res: Response, next: NextFunction) {
	const connection = await pool.getConnection()
	res.locals.db = connection;

	res.on('finish', () => {
		connection.release()
	})

	next()
}

export async function get_last_insert_id (connection: mysql.Connection) {
	const [idRaw, fields] = await connection.query(`SELECT LAST_INSERT_ID();`)

	return (idRaw as mysql.RowDataPacket)[0]['LAST_INSERT_ID()']
} 

export async function cleanupDB() {
	await pool.end()
}