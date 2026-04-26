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
        channel = await Channel.create({
          name,
          workspaceId: workspace._id,
          creator: req.user._id,
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
    const channels = await Channel.find({ workspaceId }).sort({ createdAt: 1 });
    res.status(200).json(channels);
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
    if (!workspace || workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete channels in this workspace' });
    }

    await Channel.deleteOne({ _id: id });
    res.status(200).json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { findOrCreateChannel, getWorkspaceChannels, deleteChannel };
