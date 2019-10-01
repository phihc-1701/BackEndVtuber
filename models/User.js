var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var UserSchema = new mongoose.Schema({
  username: {type: String, unique: true, index: true, required: [true, "can't be blank"], match:  [/^[a-zA-Z0-9]+$/, 'is invalid'], minlength:[6, "username more than 6 degits"]},
  email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  sex: String,
  firstName: String,
  lastName: String,
  birthday: Date,
  image: String,
  isDelete: Boolean,
  createBy: String,
  updateBy: String,
  hash: String,
  salt: String,
  notes: String
}, {timestamps: true});

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

mongoose.model('User', UserSchema);
