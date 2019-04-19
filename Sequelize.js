const Sequelize = require('sequelize')
const fs = require('fs')
const path = require('path')

const isDev = true
// const isDev = false

const sequelize = new Sequelize('postgres:///art_gallery', {
  // operatorsAliases: Sequelize.Op,
  // operatorsAliases: false,
  logging: false,
}) 

sequelize
.authenticate()
.then(() => {
  console.log('Connection has been established successfully.')
  const imageDirectory = '../art-gallery-gatsby/src/images/artworks/'
  // sequelize.sync()
  return sequelize.sync({ force: isDev })
  .then(() => {
    return isDev &&
    fs.rmdir(imageDirectory,
    err => {
      if (err) { 
        console.log('did not remove artworks dir', err)
        if (err.errno === -66) {
          fs.readdir(imageDirectory,
          (err, files) => {
            if (files.length === 0 || err) { 
              console.log('no images', err);
              return 
            }
            files.forEach(file => {
              fs.unlinkSync(path.join(imageDirectory, file),
              err => {
                if (err) { console.log('could not unlink artwork image', err) }
                else { console.log('unlinked artwork image') }
              })
            })
            fs.rmdir(imageDirectory,
            err => {
              if (err) { console.log('still could not rmdir', err) }
              else { console.log('rmdir the dir') }
            })
          })
        } else if (err.errno === -2) { 
          console.log('no artworks dir')
          return
        }
      } else { console.log('removed all artworks') }
    })
  })
  .catch(() => console.log('herro'))
})
.catch(err => { 
  console.error('Unable to connect to the database:', err)
})

module.exports = {
    sequelize,
    Sequelize,
}