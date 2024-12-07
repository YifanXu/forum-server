import { Request, Response, NextFunction } from 'express';
// import mysql, { FieldInfo, MysqlError } from 'mysql'
import mysql, { RowDataPacket } from 'mysql2/promise'

export var pool: mysql.Pool
var infoSchema: Record<string, string[]> = {}

// Wait don't hand out the user auth data like candy
const bannedColumnNames: Record<string, string[]> = {
    users: ['salt', 'hash']
}

export async function initDB() {
	pool = mysql.createPool({
		connectionLimit: 10,
		host     : process.env.DB_HOST,
		user     : process.env.DB_USER,
		password : process.env.DB_SECRET,
		database : process.env.DB_SCHEMA
	});

    const [rows] = await pool.execute(`SELECT table_name as tab, column_name as col FROM information_schema.columns WHERE table_schema = "forum"`)

    for (const row of rows as RowDataPacket[]) {
        const table = row.tab
        if (bannedColumnNames[table] && bannedColumnNames[table].includes(row.col)) continue
        if (!infoSchema[table]) infoSchema[table] = []
        infoSchema[table].push(row.col)
    }

    // console.log(generateSelector({ 'targetThread': [ 'thread', 'T' ]}))
    // const [r2] = await pool.execute(`SELECT F.*, ${generateSelector({ 'targetThread': [ 'thread', 'T' ]})} FROM forum F LEFT JOIN thread T ON F.lastUpdatedThread = T.id;`)
    // console.log(r2)

    // console.log((r2 as RowDataPacket[]).map(r => bundleOutputRaw(r)))
}

export function generateSelector(schema: Record<string, [table: string, source: string]>) {

    const total = []

    for (const [target, [table, source]] of Object.entries(schema)) {
        if (!infoSchema[table]) {
            throw new Error(`unrecognized table ${table}`)
        }
        for (const col of infoSchema[table]) {
            total.push(`${source}.${col} AS \`${target}.${col}\``)
        }
    }

    return total.join(',')
}

function slotEntry(target: Record<string, string | object> , key: string[], value: any, keyOffset: number = 0) {
    const ckey = key[keyOffset]
    if (keyOffset == key.length - 1) {
        target[ckey] = value
        return
    }

    if (!target[ckey] || typeof(target[ckey]) !== 'object') {
        target[ckey] = {}
    }

    slotEntry(target[ckey] as Record<string, string | object>, key, value, keyOffset + 1)
}

export function bundleOutputRaw(rawOutput: mysql.RowDataPacket): object {
    const output = {}
    for (const [key, value] of Object.entries(rawOutput)) {
        if (value === null) continue;
        slotEntry(output, key.split('.'), value)
    }
    return output
}

export function bundleOutput (rawOutput: [mysql.QueryResult, mysql.FieldPacket[]]) {
    return (rawOutput[0] as mysql.RowDataPacket[]).map(r => bundleOutputRaw(r))
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