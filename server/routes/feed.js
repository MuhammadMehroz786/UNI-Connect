const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const multer = require('multer');
const Feed = require('../models/Feed');

// File path to store deleted posts log
const logFilePath = path.join(__dirname, '../logs/deleted_posts_log.json');

// Multer setup to store image in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Function to log deleted posts
const logDeletedPost = (deletedPost) => {
    let logs = [];

    if (fs.existsSync(logFilePath)) {
        const fileData = fs.readFileSync(logFilePath, 'utf8');
        logs = JSON.parse(fileData);
    }

    logs.push({ ...deletedPost.toObject(), deletedAt: new Date() });

    fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
};

// Get all feed posts
router.get('/', async (req, res) => {
    try {
        const feeds = await Feed.find({}, '-image.data'); // exclude binary image data to reduce payload
        res.json(feeds);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get image for a specific post
router.get('/:id/image', async (req, res) => {
    try {
        const post = await Feed.findById(req.params.id);
        if (!post || !post.image || !post.image.data) {
            return res.status(404).send('Image not found');
        }

        res.set('Content-Type', post.image.contentType);
        res.send(post.image.data);
    } catch (err) {
        res.status(500).send('Error fetching image');
    }
});

router.post('/', upload.single('image'), async (req, res) => {
  console.log('--- Incoming POST ---');
  console.log('req.body:', req.body);
  console.log('req.file:', req.file); // should show file metadata if image uploaded

  try {
    const { uid, name, content } = req.body;

    // Ensure post has either content or an image
    if (!uid || !name || (!content && !req.file)) {
      console.log('Validation failed:', { uid, name, content, hasFile: !!req.file });
      return res.status(400).json({ error: 'Post must have at least an image' });
    }

    const newFeed = new Feed({
      user: { uid, name },
      content: content || '' // Allow empty string for content
    });

    if (req.file) {
      newFeed.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      };
    }

    const saved = await newFeed.save();
    console.log('Saved post:', saved._id);
    res.json(saved);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: err.message });
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

// Delete a feed post by ID (with logging)
router.delete('/:id', async (req, res) => {
    try {
        const deletedFeed = await Feed.findByIdAndDelete(req.params.id);
        if (!deletedFeed) {
            return res.status(404).json({ message: 'Post not found' });
        }

        logDeletedPost(deletedFeed);
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
