import express, { Request, Response, NextFunction } from 'express';
// import bcrypt from 'bcrypt';
import mysql, { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { bundleOutput, db_middleware, generateSelector, pool } from '../db';
import authRouter, { optionalSessionMiddleware, sessionMiddleware } from './auth';
import { AuthToken, Forum, ForumStats, Post, Thread } from './types';

const pageLimit: number = 10

const router = express();

function getPage(pageRaw: string): number {
	if (!pageRaw) return 1
	const page = parseInt(pageRaw)
	return isNaN(page) ? 1 : page
}

router.use(express.urlencoded({ extended: false }));

router.use('/auth', authRouter)

// Route for homepage
router.get('/', (req: Request, res: Response) => {
	res.render('index.ejs');
})

router.get('/', (req, res) => {
	res.send('Hello world!');
});


var statPromise: Promise<ForumStats> | null = null
export var statCache: ForumStats | null
async function fetchStats(): Promise<ForumStats> {
	const db = await pool.getConnection()

	const stats: ForumStats = {
		totalUsers: ((await db.query(`SELECT COUNT(*) as count FROM users`))[0] as RowDataPacket[])[0].count,
		totalThreads: ((await db.query(`SELECT COUNT(*) as count FROM thread`))[0] as RowDataPacket[])[0].count,
		totalPosts: ((await db.query(`SELECT COUNT(*) as count FROM post`))[0] as RowDataPacket[])[0].count,
		latestThreads: []
	};

	stats.latestThreads = bundleOutput(await db.query(`
		SELECT T.*, F.name AS parentForumName, ${generateSelector({
		'initialPost': ['post', 'P1'],
		'lastPost': ['post', 'P2'],
		'initialPost.author': ['users', 'U1'],
		'lastPost.author': ['users', 'U2'],
	})} FROM thread T
		INNER JOIN forum F ON T.parentForumId = F.id
		LEFT JOIN post P1 ON T.initialPost = P1.id
		LEFT JOIN post P2 ON T.lastPost = P2.id
		LEFT JOIN users U1 ON P1.author = U1.user_id
		LEFT JOIN users U2 ON P2.author = U2.user_id
		ORDER BY P2.time ASC
		LIMIT 5
	`)) as Thread[]
	db.release()
	return stats
}

router.get('/forumStats', async (req, res) => {
	if (statCache) {
		res.json(statCache)
		return
	}
	if (statPromise) {
		res.json(await statPromise)
		return
	}

	statPromise = fetchStats()
	statCache = await statPromise
	res.json(statCache)
});

router.get('/threadFeed', db_middleware, sessionMiddleware, async (req, res) => {
	const connection: mysql.PoolConnection = res.locals.db
	const userId = res.locals.userId
	const data = bundleOutput(await connection.execute(`
		SELECT T.*, F.name AS parentForumName, ${generateSelector({
		'initialPost': ['post', 'P1'],
		'lastPost': ['post', 'P2'],
		'initialPost.author': ['users', 'U1'],
		'lastPost.author': ['users', 'U2'],
	})} FROM thread T
		INNER JOIN forum F ON T.parentForumId = F.id
		INNER JOIN \`user-forum\` UF ON UF.forumID = F.id 
		LEFT JOIN post P1 ON T.initialPost = P1.id
		LEFT JOIN post P2 ON T.lastPost = P2.id
		LEFT JOIN users U1 ON P1.author = U1.user_id
		LEFT JOIN users U2 ON P2.author = U2.user_id
		WHERE UF.userID = ? AND P1.time > UF.time
		ORDER BY P2.time ASC
		LIMIT 10
	`, [userId]))
	res.json(data)
});

router.get('/postFeed', db_middleware, optionalSessionMiddleware, async (req, res) => {
	const userId = res.locals.userId
	const connection: mysql.PoolConnection = res.locals.db
	if (userId) {

	}
	const data = userId
		? bundleOutput(await connection.execute(`
		SELECT P.*, T.title AS parentThreadTitle, F.id AS parentForumId, F.name AS parentForumName, ${generateSelector({
			'author': ['users', 'U'],
		})} FROM post P
		INNER JOIN thread T ON T.id = P.threadID
		INNER JOIN \`user-thread\` UT ON UT.threadID = T.id 
		INNER JOIN users U ON P.author = U.user_id
		INNER JOIN forum F ON T.parentForumId = F.id
		WHERE UT.userID = ? AND P.time > UT.time
		ORDER BY P.time ASC
		LIMIT 10
	`, [userId]))
		: bundleOutput(await connection.query(`
		SELECT P.*, T.title AS parentThreadTitle, F.id AS parentForumId, F.name AS parentForumName, ${generateSelector({
			'author': ['users', 'U'],
		})} FROM post P
		INNER JOIN thread T ON T.id = P.threadID
		INNER JOIN users U ON P.author = U.user_id
		INNER JOIN forum F ON T.parentForumId = F.id
		ORDER BY P.time ASC
		LIMIT 10
	`))
	res.json(data)
});

router.get('/forumsList', db_middleware, async (req, res) => {
	const connection: mysql.PoolConnection = res.locals.db
	const data = (await connection.query(`
		SELECT id, name FROM forum
	`))[0] as RowDataPacket[]
	res.json(data)
})

router.get('/forums', db_middleware, async (req, res) => {
	const connection: mysql.PoolConnection = res.locals.db
	const data = bundleOutput(await connection.query(`
		SELECT F.*, ${generateSelector({
		'lastUpdatedThread': ['thread', 'T'],
		'lastUpdatedThread.initialPost': ['post', 'P1'],
		'lastUpdatedThread.lastPost': ['post', 'P2'],
		'lastUpdatedThread.initialPost.author': ['users', 'U1'],
		'lastUpdatedThread.lastPost.author': ['users', 'U2'],
	})} FROM forum F 
		LEFT JOIN thread T ON F.lastUpdatedThread = T.id
		LEFT JOIN post P1 ON T.initialPost = P1.id
		LEFT JOIN post P2 ON T.lastPost = P2.id
		LEFT JOIN users U1 ON P1.author = U1.user_id
		LEFT JOIN users U2 ON P2.author = U2.user_id;
	`))
	res.json(data)
})

router.get('/forums/:forumId', db_middleware, optionalSessionMiddleware, async (req, res) => {
	const connection: mysql.PoolConnection = res.locals.db
	const { forumId } = req.params
	const data = bundleOutput(await connection.execute(`
		SELECT F.*, ${generateSelector({
		'lastUpdatedThread': ['thread', 'T'],
		'lastUpdatedThread.initialPost': ['post', 'P1'],
		'lastUpdatedThread.lastPost': ['post', 'P2'],
		'lastUpdatedThread.initialPost.author': ['users', 'U1'],
		'lastUpdatedThread.lastPost.author': ['users', 'U2'],
	})} FROM forum F 
		LEFT JOIN thread T ON F.lastUpdatedThread = T.id
		LEFT JOIN post P1 ON T.initialPost = P1.id
		LEFT JOIN post P2 ON T.lastPost = P2.id
		LEFT JOIN users U1 ON P1.author = U1.user_id
		LEFT JOIN users U2 ON P2.author = U2.user_id
		WHERE F.id = ?;
	`, [forumId]))
	if (data.length === 0) {
		res.status(404).send()
		return
	}
	const userId = res.locals.userId
	const sub = userId ? ((await connection.execute('SELECT * FROM `user-forum` WHERE userID = ? AND forumID = ?', [userId, forumId]))[0] as RowDataPacket[]).length > 0 : false
	res.json({
		...data[0],
		subscribed: sub
	})
});

router.get('/forums/:forumId/threads', db_middleware, async (req, res) => {
	const connection: mysql.PoolConnection = res.locals.db
	const { forumId } = req.params
	const page = getPage(req.query['page'] as string)
	const data = bundleOutput(await connection.query(`
		SELECT T.*, ${generateSelector({
		'initialPost': ['post', 'P1'],
		'lastPost': ['post', 'P2'],
		'initialPost.author': ['users', 'U1'],
		'lastPost.author': ['users', 'U2'],
	})} FROM thread T
		LEFT JOIN post P1 ON T.initialPost = P1.id
		LEFT JOIN post P2 ON T.lastPost = P2.id
		LEFT JOIN users U1 ON P1.author = U1.user_id
		LEFT JOIN users U2 ON P2.author = U2.user_id
		WHERE T.parentForumId = ?
		ORDER BY P2.time ASC
		LIMIT ? OFFSET ?
	`, [parseInt(forumId), pageLimit, pageLimit * (page - 1)]))
	res.json(data)
});

router.get('/threads/:threadId', db_middleware, async (req, res) => {
	const connection: mysql.PoolConnection = res.locals.db
	const { threadId } = req.params
	const data = bundleOutput(await connection.query(`
		SELECT T.*, F.name AS parentForumName, ${generateSelector({
		'initialPost': ['post', 'P1'],
		'lastPost': ['post', 'P2'],
		'initialPost.author': ['users', 'U1'],
		'lastPost.author': ['users', 'U2'],
	})} FROM thread T
		INNER JOIN forum F ON T.parentForumId = F.id
		LEFT JOIN post P1 ON T.initialPost = P1.id
		LEFT JOIN post P2 ON T.lastPost = P2.id
		LEFT JOIN users U1 ON P1.author = U1.user_id
		LEFT JOIN users U2 ON P2.author = U2.user_id
		WHERE T.id = ?;
	`, [threadId]))
	if (data.length === 0) {
		res.status(404).send()
		return
	}
	const userId = res.locals.userId
	const sub = userId ? ((await connection.execute('SELECT * FROM `user-thread` WHERE userID = ? AND threadID = ?', [userId, threadId]))[0] as RowDataPacket[]).length > 0 : false
	res.json({
		...data[0],
		subscribed: sub
	})
});

router.get('/threads/:threadId/posts', db_middleware, async (req, res) => {
	const connection: mysql.PoolConnection = res.locals.db
	const { threadId } = req.params
	const page = getPage(req.query['page'] as string)
	const data = bundleOutput(await connection.query(`
		SELECT P.*, ${generateSelector({
		'author': ['users', 'U'],
	})} FROM post P
		INNER JOIN thread T ON T.id = P.threadID
		INNER JOIN users U ON P.author = U.user_id
		WHERE T.id = ?
		ORDER BY P.time ASC
		LIMIT ? OFFSET ?
	`, [threadId, pageLimit, pageLimit * (page - 1)]))
	res.json(data)
});

router.get('/users/:userId', db_middleware, async (req, res) => {
	const connection: mysql.PoolConnection = res.locals.db
	const { userId } = req.params
	const data = (await connection.query(`
		SELECT user_id, username, flair, pic, registered, threadCount, postCount
		FROM users WHERE user_id = ?
	`, [userId]))[0] as RowDataPacket[]
	if (data.length === 0) res.status(404).send()
	else res.json(data[0])
});

router.put('/users/:userId', express.json(), db_middleware, sessionMiddleware, async (req, res) => {
	const submittingUser = res.locals.userId
	const { userId } = req.params
	const { username, flair, pic }: { username: string, flair: string, pic: string } = req.body

	if (parseInt(userId) !== submittingUser) {
		res.status(401).send('Must be signed in as the user you are updating.')
		return
	}
	const connection: mysql.PoolConnection = res.locals.db
	await connection.execute(`
		UPDATE users SET username = ?, flair = ?, pic = ? WHERE user_id = ?
	`, [username, flair, pic, submittingUser])

	const data = (await connection.query(`
		SELECT user_id, username, flair, pic, registered, threadCount, postCount
		FROM users WHERE user_id = ?
	`, [submittingUser]))[0] as RowDataPacket[]

	res.status(200).json(data[0])
})

router.get('/users/:userId/posts', db_middleware, async (req, res) => {
	const connection: mysql.PoolConnection = res.locals.db
	const { userId } = req.params
	const data = bundleOutput(await connection.query(`
		SELECT P.*, T.title AS parentThreadTitle, F.id AS parentForumId, F.name AS parentForumName FROM post P
		INNER JOIN thread T ON P.threadID = T.id
		INNER JOIN forum F ON T.parentForumId = F.id
		WHERE P.author = ?
		ORDER BY P.time DESC
		LIMIT 10
	`, [userId]))
	res.json(data)
})

router.post('/threads/:threadId/reply', express.json(), db_middleware, sessionMiddleware, async (req, res) => {
	const { content } = req.body
	const userId: number = res.locals.userId
	const connection: mysql.PoolConnection = res.locals.db
	const threadId = parseInt(req.params.threadId)

	if (!content) {
		res.status(400).send('Must include content')
	}

	if (isNaN(threadId)) {
		res.status(400).send('Invalid thread id')
		return
	}

	// Make sure thread exists first
	const threadQuery = (await connection.execute(`SELECT parentForumId, postCount FROM thread WHERE id = ?`, [threadId]))[0] as RowDataPacket[]
	if (threadQuery.length === 0) {
		res.status(404).send(`No thread with id ${threadId}`)
		return
	}
	const postCount = threadQuery[0].postCount

	await connection.query(`START TRANSACTION`)
	const insertRes = (await connection.execute(`
		INSERT INTO post (author, content, threadID) VALUES (?, ?, ?)
		`, [userId, content, threadId]))[0] as ResultSetHeader
	await connection.execute('UPDATE thread SET lastPost = ?, postCount = postCount + 1 WHERE id = ?', [insertRes.insertId, threadId])
	await connection.execute('UPDATE forum SET lastUpdatedThread = ? WHERE id = ?', [threadId, threadQuery[0].parentForumId])
	await connection.execute('UPDATE users SET postCount = postCount + 1 WHERE user_id = ?', [userId])
	await connection.query(`COMMIT`)

	res.status(200).json({
		id: insertRes.insertId,
		order: postCount
	})
});

router.post('/forums/:forumId/newthread', express.json(), db_middleware, sessionMiddleware, async (req, res) => {
	const { title, content } = req.body
	const userId: number = res.locals.userId
	const connection: mysql.PoolConnection = res.locals.db
	const forumId = parseInt(req.params.forumId)

	if (isNaN(forumId)) {
		res.status(400).send('Invalid thread id')
		return
	}

	// Make sure forum exists first
	const thread = (await connection.execute(`SELECT id FROM forum WHERE id = ?`, [forumId]))[0] as RowDataPacket[]
	if (thread.length === 0) {
		res.status(404).send(`No forum with id ${forumId}`)
		return
	}

	await connection.query('START TRANSACTION')
	const threadInsertRes = (await connection.execute(`
		INSERT INTO thread (parentForumId, title) VALUES (?, ?)
		`, [forumId, title]))[0] as ResultSetHeader
	const postInsertRes = (await connection.execute(`
		INSERT INTO post (author, content, threadID) VALUES (?, ?, ?)
		`, [userId, content, threadInsertRes.insertId]))[0] as ResultSetHeader
	await connection.execute(`
		UPDATE thread SET initialPost = ?, lastPost = ? WHERE id = ?
		`, [postInsertRes.insertId, postInsertRes.insertId, threadInsertRes.insertId])
	await connection.execute('UPDATE users SET postCount = postCount + 1, threadCount = threadCount + 1 WHERE user_id = ?', [userId])
	await connection.execute('UPDATE forum SET threadCount = threadCount + 1, lastUpdatedThread = ? WHERE id = ?', [threadInsertRes.insertId, forumId])
	await connection.query('COMMIT')

	if (statCache) {
		statCache.totalThreads++
		statCache.totalUsers++
	}

	res.status(201).json({ threadId: threadInsertRes.insertId })
})

router.post('/forums/:forumId/subscribe', express.json(), db_middleware, sessionMiddleware, (req, res) => {
	const { subscribed } = req.body;
	const { forumId } = req.params
	const connection: mysql.PoolConnection = res.locals.db
	const userId = res.locals.userId

	if (subscribed) {
		connection.query('INSERT INTO `user-forum` (userID, forumID) VALUES (?, ?) ON DUPLICATE KEY UPDATE userID=userID', [userId, forumId])
	}
	else {
		connection.query('DELETE FROM `user-forum` WHERE userID = ? AND forumID = ?', [userId, forumId])
	}

	res.status(200).send()
});

router.post('/threads/:threadId/subscribe', express.json(), db_middleware, sessionMiddleware, (req, res) => {
	const { subscribed } = req.body;
	const { threadId } = req.params
	const connection: mysql.PoolConnection = res.locals.db
	const userId = res.locals.userId

	console.log('hi')

	if (subscribed) {
		connection.query('INSERT INTO `user-thread` (userID, threadID) VALUES (?, ?) ON DUPLICATE KEY UPDATE userID=userID', [userId, threadId])
	}
	else {
		connection.query('DELETE FROM `user-thread` WHERE userID = ? AND threadID = ?', [userId, threadId])
	}

	res.status(200).send()
})

router.get('/error', (req, res) => {
	throw new Error('oh no error')
})

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
	if (err) {
		console.error(err)
		return res.status(err.statusCode || 500).send(err.message);
	}
	next()
});

export default router;