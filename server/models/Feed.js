const mongoose = require('mongoose');

const FeedSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true }
    
},
{ timestamps: true });

module.exports = mongoose.model('Feed', FeedSchema);
