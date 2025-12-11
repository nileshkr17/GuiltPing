import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastCheckinDate: {
      type: Date,
      default: null,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Cascade delete: Remove user from groups and clean up related data
userSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    const userId = this._id;
    
    // Import models (avoid circular dependency)
    const Group = mongoose.model('Group');
    const Checkin = mongoose.model('Checkin');
    
    // Remove user from all groups they're a member of
    await Group.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );
    
    // Delete groups where this user was the creator and they're the only member
    // Or delete groups that become empty
    const groupsToDelete = await Group.find({
      $or: [
        { createdBy: userId, members: { $size: 0 } },
        { members: { $size: 0 } }
      ]
    });
    
    for (const group of groupsToDelete) {
      await group.deleteOne();
    }
    
    // Delete all check-ins for this user
    await Checkin.deleteMany({ userId });
    
    next();
  } catch (error) {
    next(error);
  }
});

// Also handle findByIdAndDelete and other query methods
userSchema.pre('findOneAndDelete', async function (next) {
  try {
    const user = await this.model.findOne(this.getFilter());
    if (user) {
      const Group = mongoose.model('Group');
      const Checkin = mongoose.model('Checkin');
      
      // Remove user from all groups
      await Group.updateMany(
        { members: user._id },
        { $pull: { members: user._id } }
      );
      
      // Delete empty groups or groups created by this user
      const groupsToDelete = await Group.find({
        $or: [
          { createdBy: user._id, members: { $size: 0 } },
          { members: { $size: 0 } }
        ]
      });
      
      for (const group of groupsToDelete) {
        await group.deleteOne();
      }
      
      // Delete all check-ins
      await Checkin.deleteMany({ userId: user._id });
    }
    next();
  } catch (error) {
    next(error);
  }
});

export const User = mongoose.model('User', userSchema);
