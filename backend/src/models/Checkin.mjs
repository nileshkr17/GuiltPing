import mongoose from 'mongoose';

const CheckinSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  date: { type: Date, required: true, index: true },
  completed: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Unique constraint: one check-in per user per group per day
CheckinSchema.index({ userId: 1, groupId: 1, date: 1 }, { unique: true });

export default mongoose.model('Checkin', CheckinSchema);
