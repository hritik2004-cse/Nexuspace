const Channel = require('../models/Channel');
const Workspace = require('../models/Workspace');

// @desc    Get or create a channel by name
// @route   POST /api/channels/findOrCreate
// @access  Private
const findOrCreateChannel = async (req, res) => {
  try {
    const { name, workspaceId } = req.body;
    
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
          const bcrypt = require('bcrypt');
          pinHash = await bcrypt.hash(req.body.pin, 10);
        }

        channel = await Channel.create({
          name,
          workspaceId: workspace._id,
          creator: req.user._id,
          isPrivate: isPrivateChannel,
          pinHash,
          members: [req.user._id]
        });
      } catch (err) {
        if (err.code === 11000) {
          channel = await Channel.findOne({ name, workspaceId: workspace._id });
        } else {
          throw err;
        }
      }
    }

    if (channel && (!channel.members || !channel.members.some(m => m && m.toString() === req.user._id.toString()))) {
      channel = await Channel.findByIdAndUpdate(
        channel._id,
        { $addToSet: { members: req.user._id } },
        { new: true }
      );
    }

    res.status(200).json(channel);

    // Broadcast "joined" message if it's a new join/creation (Simplified for now)
    if (req.io) {
      req.io.to(channel._id.toString()).emit('receive_message', {
        content: `@${req.user.username || req.user.name} joined the channel`,
        sender: { name: 'System', username: 'system' },
        isSystem: true,
        createdAt: new Date()
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

const getWorkspaceChannels = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    // Find all channels for workspace, but we will return them all for now so they show in sidebar.
    // Wait, the user wants them removed when they leave. We should only return ones they are a member of, PLUS the 'general' channel which is mandatory.
    const channels = await Channel.find({ workspaceId }).sort({ createdAt: 1 });
    
    const filteredChannels = channels.filter(c => 
      c.name === 'general' || 
      (c.members && c.members.some(m => m && m.toString() === req.user._id.toString())) || 
      (c.creator && c.creator.toString() === req.user._id.toString())
    );

    res.status(200).json(filteredChannels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findById(id);

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Auth check
    const workspace = await Workspace.findById(channel.workspaceId);
    if (!workspace || (workspace.owner.toString() !== req.user._id.toString() && channel.creator.toString() !== req.user._id.toString())) {
      return res.status(401).json({ message: 'Not authorized to delete this channel' });
    }

    await Channel.deleteOne({ _id: id });
    res.status(200).json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const leaveChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findById(id);
    
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    if (channel.name === 'general') return res.status(400).json({ message: 'Cannot leave the general channel' });

    channel.members = channel.members.filter(m => m.toString() !== req.user._id.toString());
    await channel.save();

    res.status(200).json({ message: 'Left channel successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { findOrCreateChannel, getWorkspaceChannels, deleteChannel, leaveChannel };
