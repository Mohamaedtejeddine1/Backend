// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Ensure it references User
  read: { type: Boolean, default: false },
  comment: { type: String },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
