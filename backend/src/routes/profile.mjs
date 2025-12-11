import express from 'express';
import { User } from '../models/User.mjs';
import { requireAuth } from '../middleware/auth.mjs';
import { log, error as logError } from '../utils/logger.mjs';

const router = express.Router();

// Get current user profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    logError('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (avatar !== undefined) {
      // Avatar can be a URL or base64 data URL
      user.avatar = avatar;
    }

    await user.save();
    
    log(`Profile updated for user ${req.userId}`);
    
    res.json({ 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        streak: user.streak
      }
    });
  } catch (err) {
    logError('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
