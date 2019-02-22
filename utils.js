function checkLoggedIn(context) {
    const Authorization = context.request.get('Authorization')
    if (Authorization) {
      const token = Authorization.replace('Bearer ', '')
      const { isLoggedIn } = jwt.verify(token, APP_SECRET)
      return isLoggedIn
    }
    throw new Error('not authenticated')
  }
  
  module.exports = {
    checkLoggedIn,
  }