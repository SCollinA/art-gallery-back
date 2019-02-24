const { ApolloServer } = require('apollo-server');
const { typeDefs, resolvers } = require('./schema')

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ authorization: req.get('Authorization') }),
    cors: {
        origin: 'http://localhost:8000',
    }
})

server.listen().then(({ url }) => console.log(`🚀 Server ready at ${url}`))