const { ApolloServer, gql } = require('apollo-server');
const Sequelize = require('sequelize')
const sequelize = new Sequelize('postgres:///apollo-server')

// The GraphQL schema
const typeDefs = gql`
    type Query {
        "A simple type for getting started!"
        hello: String
    }

    type Mutation {
        "update artwork"
        updateArtwork: String
    }

    type Gallery {
        artworks: [Artwork!]!
    }

    type Artwork {
        id: ID
        title: String
        dimensions: {
            width: Int
            height: Int
        }
        medium: String
        image: 
        sold: Boolean
    }
`

// A map of functions which return data for the schema.
const resolvers = {
    // get
    Query: {
        hello: () => 'world'
    },
    // set
    Mutation: {
        updateArtwork: () => 'update artwork'
    }
    // subscribe
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`)
})