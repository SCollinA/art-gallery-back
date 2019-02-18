const { sequelize, Sequelize } = require('./Sequelize')
const Gallery = require('./Gallery')

const Artwork = sequelize.define('artwork', {
    title: {
        type: Sequelize.STRING
    },
    width: {
        type: Sequelize.INTEGER
    },
    height: {
        type: Sequelize.INTEGER,
    },
    medium: {
        type: Sequelize.STRING
    },
    image: {
        type: Sequelize.STRING
    },
    price: {
        type: Sequelize.FLOAT
    },
    sold: {
        type: Sequelize.BOOLEAN
    }
})

// insert gallery foreign key attribute here
Artwork.belongsTo(Gallery)

module.exports = Artwork