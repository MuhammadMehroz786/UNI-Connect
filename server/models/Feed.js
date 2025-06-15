const mongoose = require('mongoose');

const FeedSchema = new mongoose.Schema({
  user: {
    uid: { type: String, required: true },
    name: { type: String, required: true }
  },
  content: { type: String, default:"" },
  image: {
    data: Buffer,          // binary data of the image
    contentType: String ,
    filename: String   // e.g., 'image/png', 'image/jpeg'

  }
}, { timestamps: true });

module.exports = mongoose.model('Feed', FeedSchema);
