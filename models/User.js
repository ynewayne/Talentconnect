const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // Ensure email is unique
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  date: {
    type: Date, // Corrected type
    default: Date.now
  },
  confirm: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('User', UserSchema); // Corrected export
