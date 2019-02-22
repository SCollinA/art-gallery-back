const jwt = require('jsonwebtoken')

function checkLoggedIn({ authorization }) {
    const { APP_SECRET } = process.env
    // const Authorization = context.request.get('Authorization')
    if (authorization) {
      const token = authorization.replace('Bearer ', '')
      const { isLoggedIn } = jwt.verify(token, APP_SECRET)
      return isLoggedIn
    }
    throw new Error('not authenticated')
}
  
module.exports = {
checkLoggedIn,
}