const Channel = require('../models/Channel');
const Workspace = require('../models/Workspace');

// @desc    Get or create a channel by name
// @route   POST /api/channels/findOrCreate
// @access  Private
const findOrCreateChannel = async (req, res) => {
  try {
    const { name } = req.body;
    
    // For simplicity without a full Workspace selector UI, we map to a default global workspace
    let globalWorkspace = await Workspace.findOne({ name: 'Nexuspace GlobalHQ' });
    if (!globalWorkspace) {
      globalWorkspace = await Workspace.create({
        name: 'Nexuspace GlobalHQ',
        owner: req.user._id,
        members: [req.user._id]
      });
    }

    let channel = await Channel.findOne({ name, workspaceId: globalWorkspace._id });
    if (!channel) {
      channel = await Channel.create({
        name,
        workspaceId: globalWorkspace._id,
        creator: req.user._id,
        members: [req.user._id]
      });
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
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { findOrCreateChannel };
