const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{ type: String }], // Firebase UIDs
  lastMessage: {
    text: String,
    sender: String,
    timestamp: Date
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema); 