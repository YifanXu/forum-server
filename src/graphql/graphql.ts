import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import http from 'http';

// The GraphQL schema
const typeDefs = `#graphql
	type Query {
		"""
		A simple query
		"""
		hello: String
	}
`;

// A map of functions which return data for the schema.
const resolvers = {
	Query: {
		hello: () => 'world',
	},
};

export async function createApolloMiddleware(httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) {
	const server =  new ApolloServer({
		typeDefs,
		resolvers,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	});
	await server.start()
	return expressMiddleware(server)
}