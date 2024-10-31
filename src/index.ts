import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createApolloMiddleware } from './graphql/graphql';

async function main() {
	const app = express();
	const httpServer = http.createServer(app);

	// Setup middlewares
	app.use(
		'/graphql',
		cors(),
		bodyParser.json(),
		await createApolloMiddleware(httpServer),
	);

	// Start Server
	await new Promise<void>(resolve => httpServer.listen(4000, resolve))

	// Signal ready
	console.log(`🚀 Server ready at http://localhost:4000/graphql`);
}

main()