// models/user.js
const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
createdAt: { 
    type: Date, 
    default: Date.now 
},
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
    trim: true, // Ensure trimming of whitespaces
    lowercase: true, // Ensure storing in lowercase
  },
  phone: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  responded: {
    type: Boolean,
    default: false,
  }
});

emailSchema.pre('save', function (next) {
  this.email = this.email.toLowerCase();
  next();
});


const Email = mongoose.model('User', emailSchema);

module.exports = Email;
