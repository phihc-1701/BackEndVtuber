const {check} = require('express-validator/check');

let validateRegisterUser = () => {
  return [ 
    check('user.username', 'username does not exists').not().isEmpty(),
    check('user.username', 'username must be Alphanumeric').isAlphanumeric(),
    check('user.username', 'username more than 6 degits').isLength({ min: 6 }),
    check('user.email', 'Invalid does not exists').not().isEmpty(),
    check('user.email', 'Invalid email').isEmail(),
    check('user.birthday', 'Invalid birthday').isISO8601('yyyy-mm-dd'),
    check('user.password', 'password more than 6 degits').isLength({ min: 6 })
  ]; 
}

let validateLogin = () => {
  return [ 
    check('user.email', 'Invalid does not exists').not().isEmpty(),
    check('user.email', 'Invalid email').isEmail(),
    check('user.password', 'password more than 6 degits').isLength({ min: 6 })
  ]; 
}

let validate = {
  validateRegisterUser: validateRegisterUser,
  validateLogin: validateLogin
};

module.exports = {validate};