import express, { Request, Response, NextFunction } from 'express'
import { db_middleware } from '../db'
import mysql from 'mysql2/promise'
import crypto from 'crypto'
import moment from 'moment'

const hashIterations = 1000;
const keylen = 100;

const router = express.Router()

router.use(db_middleware)

var sessionKey: Buffer;
function initSessionKey() {
	sessionKey = Buffer.from(process.env.SESSION_KEY as string, 'hex')
}

async function computeHash(password: string, salt: string): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		crypto.pbkdf2(password, salt, hashIterations, keylen, `sha512`, (err, key) => {
			if (err) reject(err)
			resolve(key.toString('base64'))
		})
	})
}

async function createSession(connection: mysql.Connection, userId: number) {
	if (!sessionKey) {
		initSessionKey()
	}

	const createTime = moment()
	createTime.add()
	const createTimeString = createTime.format('YYYY-MM-DD HH:mm:ss')
	await connection.query(`INSERT INTO sessions (user_id, created_at) VALUES (?, ?);`, [userId, createTimeString])
	const [results, fields] = await connection.query(`SELECT LAST_INSERT_ID();`)

	const sessionId = (results as mysql.RowDataPacket)[0]['LAST_INSERT_ID()']

	var iv = crypto.randomBytes(16)
	var plainText = `${sessionId}`

	var cipher = crypto.createCipheriv('aes-128-cbc', sessionKey, iv);
	var encrypted = cipher.update(plainText, 'utf-8', 'base64'); // `base64` here represents output encoding
	encrypted += cipher.final('base64');

	return {
		Token: `${iv.toString('base64')}.${encrypted}`,
		ExpireAt: createTime.add(process.env.SESSION_DURATION, 'minutes').toISOString()
	}
}

async function validateSession (connection: mysql.Connection, session?: string) {
	if (!session) {
		return -1
	}

	if (!sessionKey) {
		initSessionKey()
	}

	const seperatorIndex = session.indexOf('.')

	// Reject if bad format
	if (seperatorIndex == -1) {
		return -1
	}

	// Decrypt Token
	const ivEncoded = session.substring(0, seperatorIndex)
	const encryptEncoded = session.substring(seperatorIndex + 1)

	const ivBuffer = Buffer.from(ivEncoded, 'base64')
	const encrypted = Buffer.from(encryptEncoded, 'base64')

	const decypher = crypto.createDecipheriv('aes-128-cbc', sessionKey, ivBuffer);
	let decrypted = decypher.update(encrypted);
	decrypted = Buffer.concat([decrypted, decypher.final()]);

	const sessionId = parseInt(decrypted.toString())
	if (isNaN(sessionId)) {
		return -1
	}

	// Retrieve Session Data
	const [resultsRaw, fields] = await connection.query(`SELECT user_id, created_at, active FROM sessions WHERE session_id = ?`, [sessionId])
	const results = resultsRaw as mysql.RowDataPacket[]

	if (results.length == 0) {
		console.log(`could not find sessionId = ${sessionId}`)
		return -1
	}

	if (!results[0].active) {
		return -1
	}

	const created = moment(results[0].created_at, 'YYYY-MM-DD HH:mm:ss')
	const now = moment()
	const expired = created.add(process.env.SESSION_DURATION, 'minutes').isBefore(now)

	if (expired) {
		return -1
	}

	// Mark 
	await connection.query(`UPDATE sessions SET auth_count = auth_count + 1, last_used_at = ? WHERE session_id = ?`, [now.format('YYYY-MM-DD HH:mm:ss'), sessionId])

	return results[0].user_id
}

export async function sessionMiddleware (req: Request, res: Response, next: NextFunction) {
	const connection: mysql.PoolConnection = res.locals.db

	const session = req.get('Authorization')

	const id = await validateSession(connection, session)

	if (id == -1) {
		res.status(401).send('Missing or invalid session token')
		return
	}

	const assumeTarget = req.get('as_user')
	if (assumeTarget) {
		let assumeId: number = parseInt(assumeTarget)
		if (isNaN(assumeId)) {
			// Look up user
			const [resultsRaw, fields] = await connection.query(`SELECT user_id FROM users WHERE username = ?;`, [assumeTarget])
			const results = resultsRaw as mysql.RowDataPacket[]
			if (results.length > 0) {
				assumeId = results[0].user_id
			}
			else {
				res.status(400).send('Header "as_user" must be an integer')
				return
			}
		}
		
		// Verify admin status
		const [resultsRaw, fields] = await connection.execute(`SELECT type FROM users WHERE user_id = ?`, [id])
		const results = resultsRaw as mysql.RowDataPacket[]
		if (results.length > 0 && results[0].type == 2) {
			res.locals.userId = assumeId
		}
		else {
			res.status(401).send('Header "as_user" must be used with an administrator access')
			return
		}
	}
	else {
		res.locals.userId = id
	}
	next()
}

export async function adminMiddleware (req: Request, res: Response, next: NextFunction) {
	const connection: mysql.PoolConnection = res.locals.db
	const user_id: number = res.locals.userId

	const [resultsRaw, fields] = await connection.execute(`SELECT type FROM users WHERE user_id = ?`, [user_id])
	const results = resultsRaw as mysql.RowDataPacket[]

	if (results.length > 0 && results[0].type > 0) {
		res.locals.privilege = results[0].type
		next()
	}
	else {
		res.status(401).send('Unauthorized')
	}
}

router.post('/register', express.json() , async (req, res) => {
	const connection: mysql.PoolConnection = res.locals.db
	const { username, password }: { username: string, password: string } = req.body

	if (!username || !password) {
		res.status(400).send('Request body must include UserName and Password Fields')
	}

	// Check for username duplication
	const q = await connection.query({
		sql: 'SELECT username FROM users where username = ?;', 
		values: [username]
	})

	const resultsRaw = q[0]

	const results = resultsRaw as mysql.RowDataPacket[]

	if (results.length > 0) {
		res.status(400).send('Username already exists')
		return
	}

	const salt = crypto.randomBytes(16).toString('base64');

	const hash = await computeHash(password, salt);

	await connection.execute(`INSERT INTO users (username, salt, hash) VALUES (?, ?, ?);`, [username, salt, hash])

	const [idRaw, fields] = await connection.query(`SELECT LAST_INSERT_ID();`)

	const userId = (idRaw as mysql.RowDataPacket)[0]['LAST_INSERT_ID()']

	await connection.execute(`INSERT INTO player_data (user_id) VALUES (?);`, [userId])

	res.status(201).send()
})

router.post('/login', express.json(), async (req, res) => {
	const connection: mysql.PoolConnection = res.locals.db

	const { username, password }: { username: string, password: string } = req.body;

	if (!username || !password) {
		res.status(400).send('Request body must include UserName and Password Fields')
		return
	}

	const [resultsRaw, fields] = await connection.query(`SELECT user_id, username, salt, hash, type FROM users WHERE username = ?;`, [username]);
	const results = resultsRaw as mysql.RowDataPacket[]

	if (results.length === 0) {
		res.status(400).send('Incorrect username or password')
		return
	}

	const { salt, hash, user_id, type } = results[0]
	const newHash = await computeHash(password, salt);

	if (hash != newHash) {
		res.status(400).send('Incorrect username or password')
		return
	}

	const session = await createSession(connection, user_id)

	res.send({
		...session,
		Type: type
	})
})

export default router