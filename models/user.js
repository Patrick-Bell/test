// models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: false,
    trim: true,
    lowercase: true,
  },
});

userSchema.pre('save', function (next) {
  this.email = this.email.toLowerCase();
  next();
});


const User = mongoose.model('User', userSchema);

module.exports = User;
