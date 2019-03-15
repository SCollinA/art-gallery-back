const { ApolloServer } = require('apollo-server');
const { typeDefs, resolvers } = require('./schema')

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, connection }) => {
        if (connection) {
            return connection.context
        } else {
            const authorization = req.headers.authorization || ''
            console.log(authorization)
            return { authorization }
        }
        // ({ authorization: req.get('Authorization') })
    },
    cors: {
        origin: ['http://localhost:8000', // dev client port
                'http://localhost:9000', // alternate dev client port
                'http://localhost:1961', // production client port
                'https://art-gallery.collinargo.com', // production client origin
                'https://mkcrfineart.com', // production client origin
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