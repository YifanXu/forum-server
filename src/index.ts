import express from 'express'
import http from 'http'
import cors from 'cors'
import swaggerUI from 'swagger-ui-express'
import swaggerDoc from '../specification.json'
import apiRouter from './routes/api'
import dotenv from "dotenv"
import { initDB, cleanupDB } from "./db"

dotenv.config({
	path: `.env`
})

async function main() {
	await initDB()
	
	const app = express()
	app.use(cors())
	const httpServer = http.createServer(app)

	app.use('/api', apiRouter)

	app.get('/liveliness', (req, res) => {
		res.status(200)
	})

	// Serve documentations
	app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));

	if (process.env.HOST_CLIENT === 'TRUE' && process.env.CLIENT_PATH) {
		console.log(`hosting static files at ${process.env.CLIENT_PATH}`)
		app.use('/', express.static(process.env.CLIENT_PATH))
	}

	// Start Server
	await new Promise<void>(resolve => httpServer.listen(process.env.PORT, resolve))

	// Signal ready
	console.log(`🚀 Server ready at http://localhost:${process.env.PORT}`)
	console.log(`🤯 Documentation ready at http://localhost:${process.env.PORT}/docs`)
}


process.on('SIGTERM', () => {
	cleanupDB()
})

main()