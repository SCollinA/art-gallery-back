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
        galleryId: ID!, 
        title: String, 
        width: Int, 
        height: Int, 
        medium: String, 
        image: String, 
        sold: Boolean
    ): Artwork!
    updateArtwork(
        galleryId: ID!, 
        title: String, 
        width: Int, 
        height: Int, 
        medium: String, 
        image: String, 
        sold: Boolean
    ): Artwork!
    deleteArtwork(id: ID!): Boolean
}

  type Gallery {
      id: ID!
      name: String
      artworks: [Artwork]
  }

  type Artwork {
      id: ID!
      gallery: Gallery
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
            return Gallery.findOne({ where: { name: 'gallery' } })
        },
        getArtwork: async () => {
            return Artwork.findOne({ where: { name: 'artwork' } })
        }
    },
    // set
    Mutation: {
        addGallery: async () => {
            return Gallery.create({name:'gallery'})
        },
        updateGallery: () => 'update gallery',
        deleteGallery: () => 'delete gallery',
        addArtwork: () => 'add artwork',
        updateArtwork: () => 'update artwork',
        deleteArtwork: () => 'delete artwork',
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