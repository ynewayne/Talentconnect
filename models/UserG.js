const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserGSchema = new Schema({
  googleId: {
    type: String,
    required: true // Ensure googleId is required
  }
});

module.exports = mongoose.model('UserG', UserGSchema); // Corrected export
