const { gql } = require('apollo-server')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const serviceKey = require('./service_key.json')
const fs = require('fs')

const Artwork = require('./Artwork')
const Gallery = require('./Gallery')

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
            require('./utils').checkLoggedIn(context)
            return Gallery.create({ ...args.input })
        },
        updateGallery: (obj, args, context, info) => {
            require('./utils').checkLoggedIn(context)
            return Gallery.update({ ...args.input }, { 
                where: { id: args.id },
            })
            .then(() => Gallery.findByPk(args.id))
        },
        deleteGallery: (obj, args, context, info) => {
            require('./utils').checkLoggedIn(context)
            return Gallery.destroy({ where: { id: args.id } })
        },
        addArtwork: (obj, args, context, info) => {
            require('./utils').checkLoggedIn(context)
            return Artwork.create({ ...args.input })
        },
        updateArtwork: (obj, args, context, info) => {
            // try { 
                require('./utils').checkLoggedIn(context) 
            // }
            // catch (err) {
            //     console.log(err, 'not logged in')
            //     return Artwork.findByPk(args.id)
            // }
            // check if image is less than 5 MB
            const image = args.input.image && args.input.image.length < 5000000 ? 
            args.input.image : ''
            // args.input.image && 
            try {
                if (!image) {
                    fs.unlink(`../art-gallery-gatsby/src/images/artworks/${args.input.title}.jpeg`,
                    err => {
                        if (err) { console.log('artwork image file not deleted', err) }
                        else { console.log('artwork image file deleted') }
                    })
                } else {
                    // image && 
                    // write file always in order to overwrite reused artwork IDs
                    fs.writeFile(
                        `../art-gallery-gatsby/src/images/artworks/${args.input.title}.jpeg`,
                        image,
                        {
                            encoding: 'base64',
                            flag: 'w+',
                        }, 
                        err => {
                            if (err) {
                                fs.mkdir('../art-gallery-gatsby/src/images/artworks/',
                                    err => {
                                        if (err) { return console.log('could not mkdir for artwork', err) }
                                        else {
                                            fs.writeFile(
                                                `../art-gallery-gatsby/src/images/artworks/${args.input.title}.jpeg`,
                                                image,
                                                {
                                                    encoding: 'base64',
                                                    flag: 'w+',
                                                },
                                                err => {
                                                    if (err) { console.log('could not write artwork image to file', err) }
                                                    else { console.log('artwork image written to file') }
                                                }
                                            )
                                        }
                                    }
                                )  
                            } 
                        }
                    )
                }
            } catch (err) { console.log('could not write artwork image to file', err) }
            return Artwork.update({ ...args.input, image }, { 
                where: { id: args.id },
                // returning: true
            })
            .then(() => Artwork.findByPk(args.id))
            .catch(err => console.log('could not update artwork', err))
        },
        deleteArtwork: (obj, args, context, info) => {
            require('./utils').checkLoggedIn(context)
            fs.unlink(`../art-gallery-gatsby/src/images/artworks/${args.title}.jpeg`,
            err => {
                if (err) { console.log('artwork image file not deleted', err) }
                else { console.log('artwork image file deleted') }
            })
            return Artwork.destroy({ where: { id: args.id } })
        }, 
        login: (obj, args, context, info) => {
            const { APP_SECRET, ADMIN_PW } = process.env
            const saltRounds = 10
            const salt = bcrypt.genSaltSync(saltRounds)
            const pwHash = bcrypt.hashSync(ADMIN_PW, salt)
            const pwMatch = bcrypt.compareSync(args.password, pwHash)
            
            if (!pwMatch) { throw new Error('bad password') }
            console.log('good password')
            const token = jwt.sign({ isLoggedIn: true }, APP_SECRET, {
                expiresIn: 60 * 60 * 24 // expires in one day
            })
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
                    // to: 'mkcrfineart@gmail.com', // client business e-mail
                    subject: 'art gallery contact',
                    text: `${name}. ${message}. ${artwork}` 
                }, (error, info) => {
                    if (error) {
                        console.log('contact e-mail not sent!', error, info)
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