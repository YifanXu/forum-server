import express from 'express'
import http from 'http'
import cors from 'cors'

async function main() {
	const app = express()
	const httpServer = http.createServer(app)

	// Setup middlewares
	app.use(cors())

	app.get('/', (req, res) => {
		res.send('Hello World!')
	})

	// Start Server
	await new Promise<void>(resolve => httpServer.listen(4000, resolve))

	// Signal ready
	console.log(`🚀 Server ready at http://localhost:4000`)
}

main()