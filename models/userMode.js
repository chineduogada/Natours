const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please provide your name'],
  },
  email: {
    type: String,
    match: [
      /([a-z0-9\-]+)@([a-z0-9]+)\.([a-z]{2,8})(\.[a-z]{2,8})?/i,
      'please provide a valid email address',
    ],
    required: [true, 'please provide your email'],
    unique: true,
    lowercase: true,
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: [8, 'password must be 8 chars or more'],
  },
  passwordCheck: {
    type: String,
    required: [true, 'please provide a passwordCheck'],
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;

