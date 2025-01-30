const router = require('express').Router();
const Message = require('../models/Message');
const Chat = require('../models/Chat');

// Get chat messages
router.get('/chat/:chatId', async (req, res) => {
  try {
    const messages = await Message.find({
      chatId: req.params.chatId
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send message
router.post('/', async (req, res) => {
  try {
    const { chatId, senderId, text } = req.body;
    const message = new Message({ chatId, senderId, text });
    await message.save();

    // Update last message in chat
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: {
        text,
        sender: senderId,
        timestamp: new Date()
      }
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 