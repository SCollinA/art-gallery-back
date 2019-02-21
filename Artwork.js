const { sequelize, Sequelize } = require('./Sequelize')
const Gallery = require('./Gallery')

const Artwork = sequelize.define('artwork', {
    title: {
        type: Sequelize.STRING
    },
    width: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    height: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    medium: {
        type: Sequelize.STRING
    },
    image: {
        type: Sequelize.STRING({ length: 5000000 }),
        defaultValue: '',
    },
    price: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    sold: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    }
}, {
    timestamps: false
})

// insert gallery foreign key attribute here
Artwork.belongsTo(Gallery)

module.exports = Artwork