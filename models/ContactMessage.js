const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
    fullName : {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Enter a valid email'],
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
