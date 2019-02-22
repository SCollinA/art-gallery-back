const { ApolloServer } = require('apollo-server');
const { typeDefs, resolvers } = require('./schema')

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ authorization: req.get('Authorization') })
})

server.listen().then(({ url }) => console.log(`🚀 Server ready at ${url}`))