const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { typeDefs, resolvers } = require('./schema')
const fs = require('fs')
const https = require('https')
const http = require('http')
const bodyparser = require('body-parser')

const configurations = {
    // Note: You may need sudo to run on port 443
    production: { ssl: true, port: 443, hostname: 'mkcrfineart.com' },
    development: { ssl: false, port: 4000, hostname: 'localhost' }
  }
  
const environment = process.env.NODE_ENV || 'production'
const config = configurations[environment]

const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    // code below would be used to authenticate subscription
    // subscriptions: {
    //     onConnect: (connectionParams, webSocket) => {
    //         if (connectionParams.authToken) {
    //             return checkLoggedIn(connectionParams.authToken)
    //         }
    //         throw new Error('Missing auth token')
    //     }
    // },
    context: ({ req, connection }) => {
        if (connection) {
            return connection.context
        } else {
            const authorization = req.headers.authorization || ''
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

const app = express().use(bodyparser.json({limit: '5mb'}))
apollo.applyMiddleware({ app })

// Create the HTTPS or HTTP server, per configuration
var server
if (config.ssl) {
  // Assumes certificates are in .ssl folder from package root. Make sure the files
  // are secured.
  server = https.createServer(
    {
      key: fs.readFileSync(`/etc/letsencrypt/live/mkcrfineart.com/privkey.pem`),
      cert: fs.readFileSync(`/etc/letsencrypt/live/mkcrfineart.com/fullchain.pem`)
    },
    app
  )
} else {
  server = http.createServer(app)
}

// Add subscription support
apollo.installSubscriptionHandlers(server)

server.listen({ 
    port: 4000, 
    path: '/graphql',
    // hostname: 'https://art-gallery.collinargo.com/graphql' 
    // hostname: 'http://localhost' 
}, () => 
console.log(
    '🚀 Server ready at',
    `http${config.ssl ? 's' : ''}://${config.hostname}:${config.port}${apollo.graphqlPath}`
  )
)