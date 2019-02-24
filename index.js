const { ApolloServer } = require('apollo-server');
const { typeDefs, resolvers } = require('./schema')

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ authorization: req.get('Authorization') }),
    cors: {
        origin: ['http://localhost:8000',
                'http://localhost:1961',
                'https://art-gallery.collinargo.com',
        ],
    }
})

server.listen().then(({ url }) => console.log(`🚀 Server ready at ${url}`))