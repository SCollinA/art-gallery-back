const { sequelize, Sequelize } = require('./Sequelize')
const Artwork = require('./Artwork')

const Gallery = sequelize.define('gallery', {
    name: {
        type: Sequelize.STRING
    }
}, {
    timestamps: false
})
  
module.exports = Gallery