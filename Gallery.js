const { sequelize, Sequelize } = require('./Sequelize')

const Gallery = sequelize.define('gallery', {
    name: {
        type: Sequelize.STRING
    }
})
  
module.exports = Gallery