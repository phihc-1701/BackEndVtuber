module.exports = {
  secretKey: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret'
};
