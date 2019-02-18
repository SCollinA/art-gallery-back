const { ApolloServer, gql } = require('apollo-server');
const Artwork = require('./Artwork')
const Gallery = require('./Gallery')
const { sequelize, Sequelize } = require('./Sequelize')

// The GraphQL schema
const typeDefs = gql`
  type Query {
      "get a collection of artworks"
      getGallery: Gallery!
      "get a single artwork"
      getArtwork: Artwork!
  }

type Mutation {
    addGallery(name: String): Gallery!
    updateGallery: Gallery!
    deleteGallery: Boolean
    addArtwork(
        galleryId: Int, 
        title: String, 
        width: Int, 
        height: Int, 
        medium: String, 
        image: String, 
        sold: Boolean
    ): Artwork!
    updateArtwork: Artwork!
    deleteArtwork: Boolean
}

  type Gallery {
      id: ID!
      name: String
      artworks: [Artwork]
  }

  type Artwork {
      id: ID!
      galleryId: ID!
      title: String 
      width: Int
      height: Int
      medium: String
      image: String
      sold: Boolean
  }
`

// A map of functions which return data for the schema.
const resolvers = {
    // get
    Query: {
        getGallery: async () => {
            return Gallery.findOne({ where: { name: 'John' }})
        }
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