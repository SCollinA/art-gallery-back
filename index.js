const { ApolloServer } = require('apollo-server');
const { typeDefs, resolvers } = require('./schema')

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ authorization: req.get('Authorization') }),
    cors: {
        origin: ['http://localhost:8000', // dev client port
                'http://localhost:1961', // production client port
                'https://art-gallery.collinargo.com', // production client origin
        ],
    }
})

server.listen({ 
    port: 4000, 
    path: '/graphql',
    // hostname: 'https://art-gallery.collinargo.com/graphql' 
    // hostname: 'http://localhost' 
})
.then(({ url }) => console.log(`🚀 Server ready at ${url}`))