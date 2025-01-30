const router = require('express').Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');

// Get user's chats
router.get('/user/:userId', async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.params.userId
    });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new chat
router.post('/', async (req, res) => {
  try {
    const { participants } = req.body;
    
    if (!Array.isArray(participants) || participants.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid participants array'
      });
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: participants }
    });

    if (existingChat) {
      return res.json({
        success: true,
        chat: existingChat
      });
    }

    // Create new chat
    const newChat = new Chat({
      participants,
      createdAt: new Date()
    });

    await newChat.save();

    res.status(201).json({
      success: true,
      chat: newChat
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating chat'
    });
  }
});

module.exports = router; 