const Sequelize = require('sequelize')
const sequelize = new Sequelize('postgres:///art-gallery', {
  operatorsAliases: Sequelize.Op
})

sequelize
.authenticate()
.then(() => {
    console.log('Connection has been established successfully.')
    sequelize.sync({ force: true })
})
.catch(err => {
  console.error('Unable to connect to the database:', err)
})

module.exports = {
    sequelize,
    Sequelize,
}