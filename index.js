const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schema')

const express = require('express')
const app = express()
const port = 4000

app.get('/', (req, res) => res.send('Hello World!'))

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

server.applyMiddleware({ app })

app.listen({ port }, () => {
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
    console.log(`🚀 app ready at http://localhost:4000/`)
})