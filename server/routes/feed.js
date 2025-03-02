const express = require('express');
const router = express.Router();
const Feed = require('../models/Feed');

// Get all feed posts
router.get('/', async (req, res) => {
    try {
        const feeds = await Feed.find().populate('user');
        res.json(feeds);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new feed post
router.post('/', async (req, res) => {
    try {
        const { user, content } = req.body;
        const newFeed = new Feed({ user, content });
        await newFeed.save();
        res.json(newFeed);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a feed post by ID
router.put('/:id', async (req, res) => {
    try {
        const { content } = req.body;
        const updatedFeed = await Feed.findByIdAndUpdate(
            req.params.id,
            { content },
            { new: true, runValidators: true }
        );
        if (!updatedFeed) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(updatedFeed);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a feed post by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedFeed = await Feed.findByIdAndDelete(req.params.id);
        if (!deletedFeed) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
