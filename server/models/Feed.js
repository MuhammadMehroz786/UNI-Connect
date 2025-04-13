const mongoose = require('mongoose');

const FeedSchema = new mongoose.Schema({
    user: {
        uid: { type: String, required: true },
        name: { type: String, required: true }
    },
    content: { type: String, required: true }
},
{ timestamps: true });

module.exports = mongoose.model('Feed', FeedSchema);