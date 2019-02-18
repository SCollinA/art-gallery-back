const { ApolloServer, gql } = require('apollo-server');
const Artwork = require('./Artwork')
const Gallery = require('./Gallery')
const { sequelize, Sequelize } = require('./Sequelize')

// The GraphQL schema
const typeDefs = gql`
    input ArtworkInput {
        id: ID
        gallery: GalleryInput
        title: String 
        width: Int
        height: Int
        medium: String
        image: String
        sold: Boolean
    }
    
    input GalleryInput {
        id: ID
        name: String
        artworks: [ArtworkInput]
    }

    type Query {
        "get a collection of artworks"
        getGallery(id: ID!): Gallery!
        "get a single artwork"
        getArtwork(id: ID!): Artwork!
    }

    type Mutation {
        addGallery(input: GalleryInput): Gallery!
        updateGallery(id: ID!, input: GalleryInput): Gallery!
        deleteGallery(id: ID!): Boolean
        addArtwork(input: ArtworkInput): Artwork!
        updateArtwork(id: ID!, input: ArtworkInput): Artwork!
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
        getGallery: (obj, args, context, info) => {
            return Gallery.findOne({ where: { id: args.id } })
        },
        // getAllGalleries: 
        getArtwork: (obj, args, context, info) => {
            return Artwork.findOne({ where: { id: args.id } })
        }
    },
    // set
    Mutation: {
        addGallery: (obj, args, context, info) => {
            return Gallery.create({...args.input})
        },
        updateGallery: (obj, args, context, info) => {
            return Gallery.update({...args.input}, { where: { id: args.id } })
        },
        deleteGallery: (obj, args, context, info) => {
            return Gallery.destroy({ where: { id: args.id } })
        },
        addArtwork: (obj, args, context, info) => {
            console.log(args)
            return Artwork.create({...args.input})
        },
        updateArtwork: (obj, args, context, info) => {
            return Artwork.update({...args.input}, { where: { id: args.id } })
        },
        deleteArtwork: (obj, args, context, info) => {
            return Artwork.destroy({ where: { id: args.id } })
        }, 
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