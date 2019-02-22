const { gql } = require('apollo-server')
const Artwork = require('./Artwork')
const Gallery = require('./Gallery')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const serviceKey = require('./service_key.json')
const fs = require('fs');

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
        price: Int
        sold: Boolean
    }
    
    input GalleryInput {
        id: ID
        name: String
        artworkIds: [ID]
    }

    type Query {
        "get a collection of artworks"
        getGallery(id: ID!): Gallery
        getGalleries(input: GalleryInput!): [Gallery]!
        getAllGalleries: [Gallery]!
        "get a single artwork"
        getArtwork(id: ID!): Artwork!
        getArtworks(input: ArtworkInput!): [Artwork]!
        getAllArtworks: [Artwork]!
    }
    
    type Mutation {
        addGallery(input: GalleryInput!): Gallery!
        updateGallery(id: ID!, input: GalleryInput!): Gallery!
        deleteGallery(id: ID!): Boolean
        addArtwork(input: ArtworkInput!): Artwork!
        updateArtwork(id: ID!, input: ArtworkInput): Artwork!
        deleteArtwork(id: ID!): Boolean

        "admin login"
        login(password: String!): AuthPayload!

        contactArtist(name: String, contactEmail: String, message: String, artwork: String): Boolean
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
        price: Int
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
        getGalleries: (obj, args, context, infor) => {
            return Gallery.findAll({
                where: args.input
            })
        },
        getAllGalleries: (obj, args, context, info) => {
            return Gallery.findAll()
        },
        getArtwork: (obj, args, context, info) => {
            return Artwork.findOne({ where: { id: args.id } })
        },
        getArtworks: (obj, args, context, info) => {
            console.log(args.input)
            return Artwork.findAll({
                where: args.input
            })
        },
        getAllArtworks: (obj, args, context, info) => {
            return Artwork.findAll()
        }
    },
    // set
    Mutation: {
        addGallery: (obj, args, context, info) => {
            return Gallery.create({ ...args.input })
        },
        updateGallery: (obj, args, context, info) => {
            return Gallery.update({ ...args.input }, { 
                where: { id: args.id },
            })
            .then(() => Gallery.findByPk(args.id))
        },
        deleteGallery: (obj, args, context, info) => {
            return Gallery.destroy({ where: { id: args.id } })
        },
        addArtwork: (obj, args, context, info) => {
            return Artwork.create({ ...args.input })
        },
        updateArtwork: (obj, args, context, info) => {
            // check if image is less than 5 MB
            const image = args.input.image.length < 5000000 && 
                args.input.image
            // args.input.image && 
            try {
                // image && 
                // write file always in order to overwrite reused artwork IDs
                fs.writeFile(
                    `../art-gallery-gatsby/src/images/artworks/${args.input.id}.jpeg`,
                    image,
                    {
                        encoding: 'base64',
                        flag: 'w+',
                    }, 
                    err => {
                        if (err) {
                            fs.mkdir('../art-gallery-gatsby/src/images/artworks/',
                                err => {
                                    if (err) { return console.log(err) }
                                    else {
                                        fs.writeFile(
                                            `../art-gallery-gatsby/src/images/artworks/${args.input.id}.jpeg`,
                                            image,
                                            {
                                                encoding: 'base64',
                                                flag: 'w+',
                                            },
                                            console.log
                                        )
                                    }
                                }
                            )  
                        }
                    }
                )
            } catch (err) { console.log(err) }
            return Artwork.update({ ...args.input, image }, { 
                where: { id: args.id },
            })
            .then(() => Artwork.findByPk(args.id))
            .catch(console.log)
        },
        deleteArtwork: (obj, args, context, info) => {
            return Artwork.destroy({ where: { id: args.id } })
        }, 
        login: (obj, args, context, info) => {
            const { APP_SECRET, ADMIN_PW } = process.env
            const pwMatch = bcrypt.compare(args.password, ADMIN_PW)
            if (!pwMatch) { return {} }
            console.log('good password')
            const token = jwt.sign(ADMIN_PW, APP_SECRET)
            return { token }
        },
        contactArtist: (obj, args, context, info) => {
            const { name, contactEmail, message, artwork } = args
            const email = 'hi@collinargo.com'
            const jwtClient = new google.auth.JWT(
                serviceKey.client_email,
                null,
                serviceKey.private_key,
                ['https://mail.google.com/'],
                null,
                serviceKey.private_key_id
            )
            jwtClient.authorize((error, tokens) => {
                if (error) {
                    console.log('could not authorize', error)
                    return false
                }
                console.log('Successfully got access token! token: ', tokens)
                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        type: 'OAuth2',
                        user: email,
                        serviceClient: serviceKey.client_id,
                        privateKey: serviceKey.private_key,
                        accessToken: tokens.access_token,
                        expires: tokens.expiry_date
                    }
                })
                transporter.sendMail({
                    from: 'An Example <' + contactEmail + '>', // this is being overwritten by gmail
                    to: 'collin.argo@gmail.com',
                    subject: 'art gallery contact',
                    text: `${name}. ${message}. ${artwork}` 
                }, (error, info) => {
                    console.log(error, info)
                    if (error) {
                        return false
                    } else { return true }
                })
            })
        }
    },
    // subscribe
}

module.exports = {
    typeDefs,
    resolvers,
}