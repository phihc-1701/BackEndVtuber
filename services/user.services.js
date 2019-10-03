var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = require('../config').secretKey;
var dbUser = mongoose.model('User');
var CONSTANTS = require('../common/constant').CONSTANTS;

let validPassword = function (password, user) {
  let hash = crypto.pbkdf2Sync(password, user.salt, 100000, 256, 'sha512').toString('hex');

  return user.hash === hash;
};

let encryptPassword = function (password) {
  let salt = crypto.randomBytes(16).toString('hex');
  let result = {
    salt: salt,
    hash: crypto.pbkdf2Sync(password, salt, 100000, 256, 'sha512').toString('hex')
  };

  return result;
}

let decryptPassword = function (password, salt) {
  let hash = crypto.pbkdf2Sync(password, salt, 100000, 256, 'sha512').toString('hex');

  return hash;
}

let generateJWT = function (user) {
  let today = new Date();
  let exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    id: user._id,
    username: user.username,
    exp: parseInt(exp.getTime() / 1000),
  }, secret);
}


let toAuthJSON = function (user) {
  return {
    username: user.username,
    email: user.email,
    token: generateJWT(user),
    image: user.image,
    sex: user.sex,
    firstName: user.firstName,
    lastName: user.lastName,
    birthday: user.birthday,
    isDelete: user.isDelete,
    notes: user.notes
  };
};

let getUserById = function (id) {
  return dbUser.findById(id);
}

let registerUser = function (user) {
  let newUser = new dbUser();
  let encryptResult = encryptPassword(user.password);

  newUser.username = user.username;
  newUser.email = user.email;
  newUser.sex = CONSTANTS.SEX.MALE;
  newUser.firstName = user.firstName;
  newUser.lastName = user.lastName;
  newUser.birthday = user.birthday;
  newUser.image = user.image;
  newUser.notes = user.notes;
  newUser.isDelete = true;
  newUser.createBy = user.createBy;
  newUser.updateBy = user.updateBy;
  newUser.salt = encryptResult.salt;
  newUser.hash = encryptResult.hash;

  return newUser.save();
}

let updateUser = function (req) {
  return dbUser.findById(req.payload.id).then(function (user) {

    // only update fields that were actually passed...
    if (typeof req.body.user.username !== 'undefined') {
      user.username = req.body.user.username;
    }
    if (typeof req.body.user.email !== 'undefined') {
      user.email = req.body.user.email;
    }
    if (typeof req.body.user.sex !== 'undefined') {
      user.sex = req.body.user.sex;
    }
    if (typeof req.body.user.firstName !== 'undefined') {
      user.firstName = req.body.user.firstName;
    }
    if (typeof req.body.user.lastName !== 'undefined') {
      user.lastName = req.body.user.lastName;
    }
    if (typeof req.body.user.birthday !== 'undefined') {
      user.birthday = req.body.user.birthday;
    }
    if (typeof req.body.user.isDelete !== 'undefined') {
      user.isDelete = req.body.user.isDelete;
    }
    if (typeof req.body.user.notes !== 'undefined') {
      user.notes = req.body.user.notes;
    }
    if (typeof req.body.user.image !== 'undefined') {
      user.image = req.body.user.image;
    }
    if (typeof req.body.user.password !== 'undefined') {
      let encryptResult = encryptPassword(req.body.user.password);
      user.salt = encryptResult.salt;
      user.hash = encryptResult.hash;
    }

    return user.save();
  });
}

let userService = {
  decryptPassword: decryptPassword,
  generateJWT: generateJWT,
  toAuthJSON: toAuthJSON,
  registerUser: registerUser,
  getUserById: getUserById,
  updateUser: updateUser,
  validPassword: validPassword
};

module.exports = userService;