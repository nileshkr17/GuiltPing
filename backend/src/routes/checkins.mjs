import express from 'express';
import Checkin from '../models/Checkin.mjs';
import { User } from '../models/User.mjs';
import { requireAuth } from '../middleware/auth.mjs';

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const date = new Date();
  const day = new Date(date.toDateString());
  try {
    // Get user's current group
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.groupId) {
      return res.status(400).json({ error: 'You must be in a group to check in' });
    }

    // Check if already checked in today for this group
    const existingCheckin = await Checkin.findOne({ 
      userId, 
      groupId: user.groupId,
      date: day 
    });
    if (existingCheckin && existingCheckin.completed) {
      return res.status(400).json({ error: 'You have already checked in today' });
    }

    // Create or update check-in with groupId
    const checkin = await Checkin.findOneAndUpdate(
      { userId, groupId: user.groupId, date: day },
      { completed: true },
      { upsert: true, new: true }
    );
    
    // streak update (based on current group check-ins)
    const last = user.lastCheckinDate ? new Date(user.lastCheckinDate.toDateString()) : null;
    if (last) {
      const yesterday = new Date(day);
      yesterday.setDate(yesterday.getDate() - 1);
      if (last.getTime() === yesterday.getTime()) {
        user.streak += 1;
      } else if (last.getTime() !== day.getTime()) {
        // Only reset if not same day (shouldn't happen due to check above)
        user.streak = 1;
      }
      // If same day, keep current streak
    } else {
      user.streak = 1;
    }
    user.lastCheckinDate = day;
    await user.save();

    res.json({ ok: true, checkin, streak: user.streak });
  } catch (e) {
    console.error('Check-in error:', e);
    res.status(500).json({ error: 'Failed to check in' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { from, to } = req.query;
  
  // Get user's current group
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Only return check-ins for current group
  const q = { userId };
  if (user.groupId) {
    q.groupId = user.groupId;
  }
  
  if (from || to) {
    q.date = {};
    if (from) q.date.$gte = new Date(new Date(from).toDateString());
    if (to) q.date.$lte = new Date(new Date(to).toDateString());
  }
  const items = await Checkin.find(q).sort({ date: -1 });
  
  // Calculate total completed days and current streak
  const totalDays = items.filter(c => c.completed).length;
  const streak = user.streak || 0;
  
  res.json({ items, totalDays, streak });
});

export default router;
