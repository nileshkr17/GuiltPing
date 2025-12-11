import express from "express";
import { Group } from "../models/Group.mjs";
import { User } from "../models/User.mjs";
import Checkin from "../models/Checkin.mjs";
import { requireAuth } from "../middleware/auth.mjs";
import { log, error as logError } from "../utils/logger.mjs";

const router = express.Router();

// Generate unique invite code
function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a new group
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, maxMembers = 10, isPublic = false, description = "" } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Group name is required" });
    }

    // Validate maxMembers
    const memberLimit = parseInt(maxMembers);
    if (isNaN(memberLimit) || memberLimit < 2 || memberLimit > 50) {
      return res.status(400).json({ error: "Member limit must be between 2 and 50" });
    }

    // Check if user already in a group
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.groupId) {
      return res.status(400).json({ error: "You are already in a group. Leave current group first." });
    }

    // Generate unique invite code
    let inviteCode;
    let attempts = 0;
    do {
      inviteCode = generateInviteCode();
      const existing = await Group.findOne({ inviteCode });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts === 10) {
      return res.status(500).json({ error: "Failed to generate unique invite code" });
    }

    const group = new Group({
      name: name.trim(),
      inviteCode,
      createdBy: req.userId,
      members: [req.userId],
      maxMembers: memberLimit,
      isPublic: Boolean(isPublic),
      description: description.trim().substring(0, 200),
    });

    await group.save();

    // Update user's groupId
    user.groupId = group._id;
    await user.save();

    log(`Group created: ${group.name} (${inviteCode}) by user ${req.userId}`);

    res.status(201).json({
      id: group._id,
      name: group.name,
      inviteCode: group.inviteCode,
      memberCount: group.members.length,
      maxMembers: group.maxMembers,
      isPublic: group.isPublic,
      description: group.description,
      createdAt: group.createdAt,
    });
  } catch (err) {
    logError("Error creating group:", err);
    res.status(500).json({ error: "Failed to create group" });
  }
});

// Join a group via invite code
router.post("/join", requireAuth, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode || inviteCode.trim().length === 0) {
      return res.status(400).json({ error: "Invite code is required" });
    }

    const group = await Group.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
    if (!group) {
      return res.status(404).json({ error: "Invalid invite code" });
    }

    // Check if group is full
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ error: "Group is full" });
    }

    const user = await User.findById(req.userId);
    
    // Check if user already in this group
    if (user.groupId && user.groupId.toString() === group._id.toString()) {
      return res.status(400).json({ error: "You are already in this group" });
    }

    // Check if user in another group
    if (user.groupId) {
      return res.status(400).json({ error: "You are already in a group. Leave current group first." });
    }

    // Add user to group
    if (!group.members.includes(req.userId)) {
      group.members.push(req.userId);
      await group.save();
    }

    // Update user's groupId
    user.groupId = group._id;
    await user.save();

    log(`User ${req.userId} joined group ${group.name} (${inviteCode})`);

    res.json({
      id: group._id,
      name: group.name,
      inviteCode: group.inviteCode,
      memberCount: group.members.length,
    });
  } catch (err) {
    logError("Error joining group:", err);
    res.status(500).json({ error: "Failed to join group" });
  }
});

// Get user's current group (must be before /:id route)
router.get("/", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (!user.groupId) {
      return res.json({ group: null });
    }

    const group = await Group.findById(user.groupId)
      .populate("members", "name email streak lastCheckinDate avatar")
      .populate("createdBy", "name email");

    if (!group) {
      // Clean up invalid reference
      user.groupId = null;
      await user.save();
      return res.json({ group: null });
    }

    // Check today's check-ins for each member
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const membersWithStatus = await Promise.all(
      group.members.map(async (member) => {
        const todayCheckin = await Checkin.findOne({
          userId: member._id,
          groupId: group._id,
          date: { $gte: todayStart, $lt: todayEnd },
        });
        
        return {
          id: member._id,
          name: member.name || member.email,
          email: member.email,
          streak: member.streak,
          avatar: member.avatar,
          isCompleted: todayCheckin?.completed || false,
          isCurrentUser: member._id.toString() === req.userId,
        };
      })
    );

    res.json({
      group: {
        id: group._id,
        name: group.name,
        inviteCode: group.inviteCode,
        memberCount: group.members.length,
        maxMembers: group.maxMembers,
        notificationTime: group.notificationTime || 20,
        createdBy: group.createdBy ? {
          id: group.createdBy._id,
          name: group.createdBy.name || group.createdBy.email,
        } : null,
        members: membersWithStatus,
        createdAt: group.createdAt,
      },
    });
  } catch (err) {
    logError("Error fetching user's group:", err);
    res.status(500).json({ error: "Failed to fetch group" });
  }
});

// Discover public groups (must be before /:id route)
router.get("/discover", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    // Find public groups that are not full and user is not a member of
    const groups = await Group.find({
      isPublic: true,
      _id: { $ne: user.groupId }, // Exclude user's current group
    })
      .populate("createdBy", "name email")
      .populate("members", "name email streak avatar")
      .select("name description inviteCode members maxMembers createdAt isPublic")
      .sort({ createdAt: -1 })
      .limit(20);

    const groupsWithStatus = groups
      .map((g) => ({
        id: g._id,
        name: g.name,
        description: g.description,
        inviteCode: g.inviteCode,
        memberCount: g.members.length,
        maxMembers: g.maxMembers,
        isFull: g.members.length >= g.maxMembers,
        createdBy: g.createdBy ? {
          id: g.createdBy._id,
          name: g.createdBy.name || g.createdBy.email,
        } : null,
        members: g.members.map((m) => ({
          id: m._id,
          name: m.name || m.email,
          email: m.email,
          streak: m.streak || 0,
          avatar: m.avatar,
        })),
        createdAt: g.createdAt,
      }))
      .filter((g) => !g.isFull); // Only show groups with space

    res.json({ groups: groupsWithStatus });
  } catch (err) {
    logError("Error discovering groups:", err);
    res.status(500).json({ error: "Failed to discover groups" });
  }
});

// Get group details by ID (must be after specific routes like / and /discover)
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "name email streak lastCheckinDate")
      .populate("createdBy", "name email");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is a member
    if (!group.members.some((m) => m._id.toString() === req.userId)) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    // Check today's check-ins for each member
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const membersWithStatus = await Promise.all(
      group.members.map(async (member) => {
        const todayCheckin = await Checkin.findOne({
          userId: member._id,
          groupId: group._id,
          date: { $gte: todayStart, $lt: todayEnd },
        });
        
        return {
          id: member._id,
          name: member.name || member.email,
          email: member.email,
          streak: member.streak,
          isCompleted: todayCheckin?.completed || false,
        };
      })
    );

    res.json({
      id: group._id,
      name: group.name,
      inviteCode: group.inviteCode,
      memberCount: group.members.length,
      maxMembers: group.maxMembers,
      createdBy: group.createdBy ? {
        id: group.createdBy._id,
        name: group.createdBy.name || group.createdBy.email,
      } : null,
      members: membersWithStatus,
      createdAt: group.createdAt,
    });
  } catch (err) {
    logError("Error fetching group:", err);
    res.status(500).json({ error: "Failed to fetch group" });
  }
});

// Update group settings (members only)
router.patch("/settings", requireAuth, async (req, res) => {
  try {
    const { notificationTime } = req.body;

    const user = await User.findById(req.userId);
    if (!user || !user.groupId) {
      return res.status(404).json({ error: "You are not in a group" });
    }

    const group = await Group.findById(user.groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Validate notificationTime if provided
    if (notificationTime !== undefined) {
      const hour = parseInt(notificationTime);
      if (isNaN(hour) || hour < 0 || hour > 23) {
        return res.status(400).json({ error: "Notification time must be between 0 and 23" });
      }
      group.notificationTime = hour;
    }

    await group.save();

    log(`Group ${group.name} settings updated by user ${req.userId}`);

    res.json({
      id: group._id,
      name: group.name,
      notificationTime: group.notificationTime,
    });
  } catch (err) {
    logError("Error updating group settings:", err);
    res.status(500).json({ error: "Failed to update group settings" });
  }
});

// Leave group
router.post("/leave", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.groupId) {
      return res.status(400).json({ error: "You are not in a group" });
    }

    const group = await Group.findById(user.groupId);
    
    if (!group) {
      // Clean up invalid reference
      user.groupId = null;
      await user.save();
      return res.status(404).json({ error: "Group not found" });
    }

    // Store groupId before clearing
    const leftGroupId = user.groupId;

    // Remove user from group members
    group.members = group.members.filter((m) => m.toString() !== req.userId);
    
    // Delete all check-ins for this user in this group
    await Checkin.deleteMany({ userId: req.userId, groupId: leftGroupId });
    
    // If group is empty or creator left, delete the group
    if (group.members.length === 0 || group.createdBy.toString() === req.userId) {
      await Group.deleteOne({ _id: group._id });
      // Clear groupId for all remaining members
      await User.updateMany({ groupId: group._id }, { groupId: null });
      log(`Group ${group.name} deleted (creator left or empty)`);
    } else {
      await group.save();
    }

    // Clear user's groupId and reset streak
    user.groupId = null;
    user.streak = 0;
    user.lastCheckinDate = null;
    await user.save();

    log(`User ${req.userId} left group ${group.name}, streak and check-ins reset`);

    res.json({ message: "Successfully left group" });
  } catch (err) {
    logError("Error leaving group:", err);
    res.status(500).json({ error: "Failed to leave group" });
  }
});

export default router;
