import express from 'express'
import http from 'http'
import cors from 'cors'
import swaggerUI from 'swagger-ui-express'
import swaggerDoc from '../specification.json'

async function main() {
	const app = express()
	app.use(cors())
	const httpServer = http.createServer(app)

	app.get('/liveliness', (req, res) => {
		res.status(200)
	})

	// Serve documentations
	app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));

	// Start Server
	await new Promise<void>(resolve => httpServer.listen(4000, resolve))

	// Signal ready
	console.log(`🚀 Server ready at http://localhost:4000`)
	console.log(`🤯 Documentation ready at http://localhost:4000/docs`)
}

main()