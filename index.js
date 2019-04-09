const express = require('express')
const helmet = require('helmet')
const redisClient = require('./redis/client')
const { ApolloServer } = require('apollo-server-express')
const { typeDefs, resolvers } = require('./schema')
const fs = require('fs')
const https = require('https')
const http = require('http')
const bodyparser = require('body-parser')
require('dotenv').config()

const configurations = {
    // Note: You may need sudo to run on port 443
    production: { ssl: true, port: 4000, hostname: 'mkcrfineart.com' },
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

let bucket = 5

const rateLimiter = (req, res, next) => {
    // receive request
    // get bucket for ip from redis
    let bucket
    try {
      redisClient.get(req.ip, (error, result) => {
        if (error) {
          console.log(error)
          throw error;
        }
        console.log('GET result ->' + result)
        bucket = result
      })
    } catch (error) {
      // or make new one if not exists
      redisClient.set(req.ip, 5, 24 * 60 * 60 * 1000, )
    }
    // check bucket
    // if notempty
    if (bucket > 0) {
    // pop one
      bucket--
    // set timeout
      setTimeout(() => {
        // if bucket is not full
        if (bucket < 5) {
          // push one
          bucket++
        }
      // after 1 sec
      }, 1 * 1000)
    // call next
      console.log('req approved', bucket)
      next()
    } else {
      console.log('req denied')
      // if empty
      res.sendStatus(429)
    }
}

// setInterval(rateLimiter, 185)

const app = express()
app.use(helmet())
app.disable('x-powered-by')
app.use(bodyparser.json({limit: '5mb'}))
app.use(rateLimiter)
apollo.applyMiddleware({ app })

// Create the HTTPS or HTTP server, per configuration
var server
if (config.ssl) {
  // Assumes certificates are in .ssl folder from package root. Make sure the files
  // are secured.
  server = https.createServer(
    {
      key: fs.readFileSync(`/etc/letsencrypt/live/${process.env.DOMAIN_NAME}/privkey.pem`),
      cert: fs.readFileSync(`/etc/letsencrypt/live/${process.env.DOMAIN_NAME}/fullchain.pem`)
    },
    app
  )
} else {
  server = http.createServer(app)
}

// Add subscription support
apollo.installSubscriptionHandlers(server)
server.listen({
  ...config,
    // port: 4000, 
    // path: '/graphql',
    // hostname: 'https://art-gallery.collinargo.com/graphql' 
    // hostname: 'http://localhost' 
}, () => 
console.log(
    '🚀 Server ready at',
    `http${config.ssl ? 's' : ''}://${config.hostname}:${config.port}${apollo.graphqlPath}`
  )
)