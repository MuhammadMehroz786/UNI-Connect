const router = require('express').Router();
const User = require('../models/User');

// Search users by email
router.get('/search', async (req, res) => {
  try {
    const { email } = req.query;
    console.log('Received search request for email:', email);

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ 
        success: false,
        message: 'Valid email parameter is required' 
      });
    }

    // Case-insensitive partial email search
    const users = await User.find({
      email: { 
        $regex: email.toLowerCase(), 
        $options: 'i'
      }
    })
    .select('firebaseUid email displayName photoURL')
    .limit(10)
    .lean(); // Convert to plain JavaScript objects

    console.log(`Found ${users.length} users for query "${email}"`);

    res.json({
      success: true,
      users: users.map(user => ({
        firebaseUid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || null
      }))
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error searching for users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create or update user
router.post('/', async (req, res) => {
  try {
    const { firebaseUid, email, displayName, photoURL } = req.body;
    console.log('Received user data:', { firebaseUid, email, displayName, photoURL });

    if (!firebaseUid || !email) {
      return res.status(400).json({ 
        success: false,
        message: 'Firebase UID and email are required' 
      });
    }

    const userData = {
      firebaseUid,
      email: email.toLowerCase(),
      displayName: displayName || '',
      photoURL: photoURL || null,
      updatedAt: new Date()
    };

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      userData,
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true 
      }
    );

    console.log('User saved:', user);
    res.json({
      success: true,
      user: {
        firebaseUid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || null
      }
    });

  } catch (error) {
    console.error('User save error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error saving user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 