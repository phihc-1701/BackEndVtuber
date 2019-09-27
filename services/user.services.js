var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = require('../config').secretKey;
var User = mongoose.model('User');

var validPassword = function(password,user) {
  var hash = crypto.pbkdf2Sync(password, user.salt, 100000, 256, 'sha512').toString('hex');
  return user.hash === hash;
};

var encryptPassword = function (password) {
  var salt = crypto.randomBytes(16).toString('hex');
  var result = {
    salt: salt,
    hash: crypto.pbkdf2Sync(password, salt, 100000, 256, 'sha512').toString('hex')
  };
  return result;
}

var decryptPassword = function (password, salt) {
  var hash = crypto.pbkdf2Sync(password, salt, 100000, 256, 'sha512').toString('hex');

  return hash;
}

var generateJWT = function (user) {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    id: user._id,
    username: user.username,
    exp: parseInt(exp.getTime() / 1000),
  }, secret);
}


var toAuthJSON = function (user) {
  return {
    username: user.username,
    email: user.email,
    token: generateJWT(user),
    image: user.image,
    sex: user.sex,
    firstName: user.firstName,
    lastName: user.lastName,
    birthday: user.birthday,
    status: user.status,
    notes: user.notes
  };
};

var getUserById = function (id) {
  return User.findById(id);
}

var registerUser = function (user) {
  var newUser = new User();
  var encryptResult = encryptPassword(user.password);

  newUser.username = user.username;
  newUser.email = user.email;
  newUser.sex = user.sex;
  newUser.firstName = user.firstName;
  newUser.lastName = user.lastName;
  newUser.birthday = user.birthday;
  newUser.status = user.status;
  newUser.notes = user.notes;
  newUser.status = user.status;
  newUser.createBy = user.createBy;
  newUser.updateBy = user.updateBy;
  newUser.salt = encryptResult.salt;
  newUser.hash = encryptResult.hash;
  return newUser.save();
}

var updateUser = function (req) {
  return User.findById(req.payload.id).then(function(user){

    // only update fields that were actually passed...
    if(typeof req.body.user.username !== 'undefined'){
      user.username = req.body.user.username;
    }
    if(typeof req.body.user.email !== 'undefined'){
      user.email = req.body.user.email;
    }
    if(typeof req.body.user.sex !== 'undefined'){
      user.sex = req.body.user.sex;
    }
    if(typeof req.body.user.firstName !== 'undefined'){
      user.firstName = req.body.user.firstName;
    }
    if(typeof req.body.user.lastName !== 'undefined'){
      user.lastName = req.body.user.lastName;
    }
    if(typeof req.body.user.birthday !== 'undefined'){
      user.birthday = req.body.user.birthday;
    }
    if(typeof req.body.user.status !== 'undefined'){
      user.status = req.body.user.status;
    }
    if(typeof req.body.user.notes !== 'undefined'){
      user.notes = req.body.user.notes;
    }
    if(typeof req.body.user.image !== 'undefined'){
      user.image = req.body.user.image;
    }
    if(typeof req.body.user.password !== 'undefined'){
      var encryptResult = encryptPassword(req.body.user.password);
      user.salt = encryptResult.salt;
      user.hash = encryptResult.hash;
    }
    return user.save();
  });
}

var userService = {
  decryptPassword: decryptPassword,
  generateJWT: generateJWT,
  toAuthJSON: toAuthJSON,
  registerUser: registerUser,
  getUserById: getUserById,
  updateUser: updateUser,
  validPassword: validPassword
};

module.exports = userService;