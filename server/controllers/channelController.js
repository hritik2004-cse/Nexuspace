const Channel = require('../models/Channel');
const Workspace = require('../models/Workspace');
const AuditLog = require('../models/AuditLog');
const Message = require('../models/Message');

// Helper to check membership across old and new formats
const isUserMember = (members, userId) => {
  if (!members || !Array.isArray(members)) return false;
  return members.some(m => {
    if (!m) return false;
    const mId = m.user ? m.user.toString() : m.toString();
    return mId === userId.toString();
  });
};

// Helper to get user role in channel
const getUserChannelRole = (channel, userId) => {
  if (!channel || !channel.members) return 'member';
  const member = channel.members.find(m => {
    const mId = m.user ? m.user.toString() : m.toString();
    return mId === userId.toString();
  });
  return member?.role || 'member';
};

// @desc    Get or create a channel by name
// @route   POST /api/channels/findOrCreate
// @access  Private
const findOrCreateChannel = async (req, res) => {
  try {
    const { name, workspaceId } = req.body;
    const User = require('../models/User');
    
    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is strictly required to join channels.' });
    }

    let workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found.' });
    }

    let channel = await Channel.findOne({ name, workspaceId: workspace._id });
    if (!channel) {
      try {
        let pinHash = null;
        const isPrivateChannel = req.body.isPrivate || false;
        if (isPrivateChannel && req.body.pin) {
          const bcrypt = require('bcryptjs');
          pinHash = await bcrypt.hash(req.body.pin, 10);
        }

        channel = await Channel.create({
          name,
          workspaceId: workspace._id,
          creator: req.user._id,
          owner: req.user._id,
          isPrivate: isPrivateChannel,
          pinHash,
          members: [{ user: req.user._id, role: 'owner' }]
        });
        
        // Add to user's channels list
        await User.findByIdAndUpdate(req.user._id, { $addToSet: { channels: channel._id } });

        // Broadcast channel creation to the workspace room
        if (req.io) {
          req.io.to(workspaceId.toString()).emit('channel_created', channel);
        }

      } catch (err) {
        if (err.code === 11000) {
          channel = await Channel.findOne({ name, workspaceId: workspace._id });
        } else {
          throw err;
        }
      }
    }

    // Check if channel exists and is private
    if (channel && channel.isPrivate) {
      const isMember = isUserMember(channel.members, req.user._id);
      const isGlobalAdmin = req.user.role === 'Admin';
      
      if (!isMember && !isGlobalAdmin) {
        if (req.body.pin) {
          const bcrypt = require('bcryptjs');
          const isMatch = await bcrypt.compare(req.body.pin, channel.pinHash);
          if (!isMatch) {
            return res.status(403).json({ message: 'Incorrect PIN for this private channel.', requiresPin: true, channelId: channel._id });
          }
        } else {
          return res.status(403).json({ message: 'This channel is private. PIN required to join.', requiresPin: true, channelId: channel._id });
        }
      }
    }

    // Join if not a member - Atomic check and update to prevent race conditions
    const updatedChannel = await Channel.findOneAndUpdate(
      { _id: channel._id, "members.user": { $ne: req.user._id } },
      { $push: { members: { user: req.user._id, role: 'member' } } },
      { new: true }
    );
    
    if (updatedChannel) {
      // User was NOT a member and has been added successfully
      channel = updatedChannel;
      
      // Sync to user model
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { channels: channel._id } });

      const joinMessage = await Message.create({
        content: `@${req.user.username || req.user.name} joined #${channel.name}`,
        channelId: channel._id,
        sender: req.user._id,
        type: 'system'
      });

      const populatedJoinMsg = await joinMessage.populate('sender', 'name avatar role username');
      if (req.io) {
        req.io.to(channel._id.toString()).emit('receive_message', {
          ...populatedJoinMsg.toObject(),
          channelName: channel.name
        });
        
        // Emit member_joined for real-time sidebar updates
        req.io.to(channel._id.toString()).emit('member_joined', {
          userId: req.user._id,
          channelId: channel._id,
          user: {
            _id: req.user._id,
            name: req.user.name,
            username: req.user.username,
            avatar: req.user.avatar || req.user.profileImage || '',
            role: req.user.role,
            channelRole: 'member'
          }
        });
      }
    }

    res.status(200).json(channel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


const getWorkspaceChannels = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    if (!workspaceId) return res.status(400).json({ message: 'Workspace ID required' });

    const channels = await Channel.find({ workspaceId }).sort({ createdAt: 1 });
    
    const filteredChannels = channels.filter(c => {
      try {
        // ALWAYS show general
        if (c.name === 'general') return true;
        
        // Check if user is in members array
        const isMember = isUserMember(c.members, req.user._id);
        if (isMember) return true;

        // Check if user is owner (redundant if they are in members, but safe)
        const isOwner = c.owner && c.owner.toString() === req.user._id.toString();
        if (isOwner) return true;

        return false;
      } catch (err) {
        console.error(`Error filtering channel ${c._id}:`, err);
        return false;
      }
    });


    const enrichedChannels = await Promise.all(filteredChannels.map(async (c) => {
      try {
        const lastReadEntry = req.user.lastRead?.find(lr => lr && lr.channelId && lr.channelId.toString() === c._id.toString());
        const lastReadAt = lastReadEntry ? lastReadEntry.lastReadAt : new Date(0);
        
        const unreadCount = await Message.countDocuments({
          channelId: c._id,
          createdAt: { $gt: lastReadAt },
          sender: { $ne: req.user._id },
          type: 'text'
        });

        return {
          ...c.toObject(),
          unreadCount: unreadCount || 0
        };
      } catch (err) {
        console.error(`Error enriching channel ${c._id}:`, err);
        return { ...c.toObject(), unreadCount: 0 };
      }
    }));

    res.status(200).json(enrichedChannels);
  } catch (error) {
    console.error('getWorkspaceChannels failure:', error);
    res.status(500).json({ message: 'Failed to fetch workspace channels', error: error.message });
  }
};


const deleteChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findById(id);

    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    const workspace = await Workspace.findById(channel.workspaceId);
    const isWorkspaceOwner = workspace && workspace.owner.toString() === req.user._id.toString();
    const isChannelOwner = channel.owner && channel.owner.toString() === req.user._id.toString();

    if (!isWorkspaceOwner && !isChannelOwner && req.user.role !== 'Admin') {
      return res.status(401).json({ message: 'Not authorized to delete this channel' });
    }

    await Channel.deleteOne({ _id: id });
    res.status(200).json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getChannelMembers = async (req, res) => {
  try {
    const { id } = req.params;
    // Force find and populate to be sure we have latest data
    const channel = await Channel.findById(id).populate('members.user', 'name avatar username role');
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    
    let membersWithRoles = [];
    
    // 1. Process structured members array
    if (channel.members && channel.members.length > 0) {
      membersWithRoles = channel.members
        .map(m => {
          if (m.user && typeof m.user === 'object') {
            const userObj = m.user.toObject();
            return {
              _id: userObj._id,
              name: userObj.name || 'Anonymous',
              username: userObj.username || 'user',
              avatar: userObj.avatar || '',
              role: userObj.role || 'Member',
              channelRole: m.role || 'member'
            };
          }
          return null;
        })
        .filter(Boolean);
    }
    
    // 2. Fallback for legacy format or missing entries
    // If the list is empty but we have an owner, at least show the owner
    if (membersWithRoles.length === 0 && channel.owner) {
      const User = require('../models/User');
      const owner = await User.findById(channel.owner).select('name avatar username role');
      if (owner) {
        membersWithRoles.push({
          ...owner.toObject(),
          channelRole: 'owner'
        });
      }
    }

    res.status(200).json(membersWithRoles);
  } catch (error) {
    console.error('getChannelMembers error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};



const updateMemberRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;
    
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const channel = await Channel.findById(id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    const memberIndex = channel.members.findIndex(m => {
      const mId = m.user ? m.user.toString() : m.toString();
      return mId === userId;
    });
    
    if (memberIndex === -1) return res.status(404).json({ message: 'User is not a member of this channel' });

    const targetMember = channel.members[memberIndex];
    // Convert legacy member to object if needed
    if (typeof targetMember !== 'object' || !targetMember.user) {
        channel.members[memberIndex] = { user: userId, role: 'member' };
    }

    if (channel.members[memberIndex].role === 'owner') {
      return res.status(400).json({ message: 'Cannot change the role of the channel owner' });
    }

    const oldRole = channel.members[memberIndex].role;
    channel.members[memberIndex].role = role;
    await channel.save();

    await AuditLog.create({
      action: 'ROLE_UPDATED',
      userId: req.user._id,
      channelId: channel._id,
      metadata: { targetUserId: userId, oldRole, newRole: role }
    });

    if (req.io) {
      req.io.to(channel._id.toString()).emit('channel_role_updated', { userId, role, channelId: id });
    }

    res.status(200).json({ message: `User role updated to ${role}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeMemberFromChannel = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const channel = await Channel.findById(id);
    
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    if (channel.name === 'general') return res.status(400).json({ message: 'Cannot remove members from the general channel' });

    const targetRole = getUserChannelRole(channel, userId);
    if (targetRole === 'owner') {
      return res.status(400).json({ message: 'Cannot remove the channel owner' });
    }

    channel.members = channel.members.filter(m => {
      const mId = m.user ? m.user.toString() : m.toString();
      return mId !== userId;
    });
    await channel.save();

    await AuditLog.create({
      action: 'MEMBER_REMOVED',
      userId: req.user._id,
      channelId: channel._id,
      metadata: { targetUserId: userId }
    });

    if (req.io) {
       req.io.to(userId).emit('session_expired', { channelId: id, reason: 'You have been removed from this channel by an administrator.' });
       req.io.to(channel._id.toString()).emit('member_removed', { userId, channelId: id });
    }

    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const transferOwnership = async (req, res) => {
  try {
    const { id } = req.params;
    const { newOwnerId } = req.body;

    const channel = await Channel.findById(id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    const memberIndex = channel.members.findIndex(m => {
       const mId = m.user ? m.user.toString() : m.toString();
       return mId === newOwnerId;
    });
    
    if (memberIndex === -1) return res.status(404).json({ message: 'New owner must be a member of the channel' });

    // Current owner becomes admin
    const oldOwnerIndex = channel.members.findIndex(m => {
       const mId = m.user ? m.user.toString() : m.toString();
       return mId === req.user._id.toString();
    });
    
    if (oldOwnerIndex !== -1) {
        if (typeof channel.members[oldOwnerIndex] === 'object' && channel.members[oldOwnerIndex].user) {
            channel.members[oldOwnerIndex].role = 'admin';
        } else {
            channel.members[oldOwnerIndex] = { user: req.user._id, role: 'admin' };
        }
    }

    // Set new owner
    if (typeof channel.members[memberIndex] === 'object' && channel.members[memberIndex].user) {
        channel.members[memberIndex].role = 'owner';
    } else {
        channel.members[memberIndex] = { user: newOwnerId, role: 'owner' };
    }
    
    channel.owner = newOwnerId;
    await channel.save();

    await AuditLog.create({
      action: 'OWNERSHIP_TRANSFERRED',
      userId: req.user._id,
      channelId: channel._id,
      metadata: { fromUserId: req.user._id, toUserId: newOwnerId }
    });

    if (req.io) {
      req.io.to(channel._id.toString()).emit('channel_role_updated', { channelId: id, ownerId: newOwnerId });
    }

    res.status(200).json({ message: 'Ownership transferred successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const leaveChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findById(id);
    
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    if (channel.name === 'general') return res.status(400).json({ message: 'Cannot leave the general channel' });

    const isOwner = channel.owner && channel.owner.toString() === req.user._id.toString();
    if (isOwner) {
      return res.status(400).json({ message: 'Owner cannot leave without transferring ownership first' });
    }

    channel.members = channel.members.filter(m => {
      const mId = m.user ? m.user.toString() : m.toString();
      return mId !== req.user._id.toString();
    });
    await channel.save();

    const leaveMessage = await Message.create({
      content: `@${req.user.username || req.user.name} left #${channel.name}`,
      channelId: channel._id,
      sender: req.user._id,
      type: 'system'
    });

    const populatedLeaveMsg = await leaveMessage.populate('sender', 'name avatar role username');
    if (req.io) {
      req.io.to(channel._id.toString()).emit('receive_message', {
        ...populatedLeaveMsg.toObject(),
        channelName: channel.name
      });
      req.io.to(channel._id.toString()).emit('member_removed', { userId: req.user._id, channelId: id });
    }

    res.status(200).json({ message: 'Left channel successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const renameChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isPrivate } = req.body;

    const channel = await Channel.findById(id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    if (channel.name === 'general') return res.status(400).json({ message: 'Cannot rename the general channel' });

    // Permission check: Owner or Channel Admin or Workspace Owner
    const workspace = await Workspace.findById(channel.workspaceId);
    const isWorkspaceOwner = workspace && workspace.owner.toString() === req.user._id.toString();
    const isChannelOwner = channel.owner && channel.owner.toString() === req.user._id.toString();
    const userRole = getUserChannelRole(channel, req.user._id);
    const isChannelAdmin = userRole === 'admin';

    if (!isWorkspaceOwner && !isChannelOwner && !isChannelAdmin && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to rename this channel' });
    }

    const oldName = channel.name;
    if (name) channel.name = name.toLowerCase().replace(/\s+/g, '-');
    if (isPrivate !== undefined) channel.isPrivate = isPrivate;
    
    await channel.save();

    await AuditLog.create({
      action: 'CHANNEL_UPDATED',
      userId: req.user._id,
      channelId: channel._id,
      metadata: { oldName, newName: channel.name, isPrivate: channel.isPrivate }
    });

    if (req.io) {
      req.io.to(channel.workspaceId.toString()).emit('channel_updated', {
        channelId: channel._id,
        name: channel.name,
        isPrivate: channel.isPrivate
      });
      
      // System message about the rename
      if (name && oldName !== channel.name) {
        const renameMsg = await Message.create({
          content: `@${req.user.username || req.user.name} renamed the channel from #${oldName} to #${channel.name}`,
          channelId: channel._id,
          sender: req.user._id,
          type: 'system'
        });
        req.io.to(channel._id.toString()).emit('receive_message', {
          ...renameMsg.toObject(),
          channelName: channel.name
        });
      }
    }

    res.status(200).json(channel);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Channel name already exists in this workspace' });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  findOrCreateChannel, 
  getWorkspaceChannels, 
  deleteChannel, 
  leaveChannel, 
  getChannelMembers, 
  removeMemberFromChannel,
  updateMemberRole,
  transferOwnership,
  renameChannel
};


