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
        type: Sequelize.STRING,
        defaultValue: '',
    },
    image: { // images must be less than 5 MB
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
    },
    framed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    recentlyupdatedimage: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    }
}, {
    timestamps: false
})

// insert gallery foreign key attribute here
Artwork.belongsTo(Gallery, {
    foreignKey: {
        allowNull: true
    },
    onDelete: 'SET NULL',
    constraints: true,
}
)

module.exports = Artwork