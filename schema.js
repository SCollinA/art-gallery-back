const { gql } = require('apollo-server')
const Artwork = require('./Artwork')
const Gallery = require('./Gallery')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// The GraphQL schema
const typeDefs = gql`
    input ArtworkInput {
        id: ID
        galleryId: ID
        title: String 
        width: Int
        height: Int
        medium: String
        image: String
        price: Float
        sold: Boolean
    }
    
    input GalleryInput {
        id: ID
        name: String
        artworkIds: [ID]
    }

    type Query {
        "get a collection of artworks"
        getGallery(id: ID!): Gallery!
        getAllGalleries: [Gallery]
        "get a single artwork"
        getArtwork(id: ID!): Artwork!
        getAllArtworks: [Artwork]
    }
    
    type Mutation {
        addGallery(input: GalleryInput!): Gallery!
        updateGallery(id: ID!, input: GalleryInput!): Gallery!
        deleteGallery(id: ID!): Boolean
        addArtwork(input: ArtworkInput!): Artwork!
        updateArtwork(id: ID!, input: ArtworkInput!): Artwork!
        deleteArtwork(id: ID!): Boolean

        "admin login"
        login(password: String): AuthPayload
    }

    type AuthPayload {
        token: String
    }

    type Gallery {
        id: ID!
        name: String
    }

    type Artwork {
        id: ID!
        galleryId: ID
        title: String 
        width: Int
        height: Int
        medium: String
        image: String
        price: Float
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
        getAllGalleries: (obj, args, context, info) => {
            return Gallery.findAll()
        },
        getArtwork: (obj, args, context, info) => {
            return Artwork.findOne({ where: { id: args.id } })
        },
        getAllArtworks: (obj, args, context, info) => {
            return Artwork.findAll()
        }
    },
    // set
    Mutation: {
        addGallery: (obj, args, context, info) => {
            return Gallery.create({...args.input})
        },
        updateGallery: (obj, args, context, info) => {
            return Gallery.update({...args.input}, { 
                where: { id: args.id },
            })
            .then(() => Gallery.findById(args.id))
        },
        deleteGallery: (obj, args, context, info) => {
            return Gallery.destroy({ where: { id: args.id } })
        },
        addArtwork: (obj, args, context, info) => {
            return Artwork.create({...args.input})
        },
        updateArtwork: (obj, args, context, info) => {
            return Artwork.update({...args.input}, { 
                where: { id: args.id },
            })
            .then(() => Artwork.findById(args.id))
        },
        deleteArtwork: (obj, args, context, info) => {
            return Artwork.destroy({ where: { id: args.id } })
        }, 
        login: (obj, args, context, info) => {
            const pwMatch = bcrypt.compare(args.password, process.env.ADMIN_PW)
            console.log('good password')
            return true
        }
    }
    // subscribe
}

module.exports = {
    typeDefs,
    resolvers,
}