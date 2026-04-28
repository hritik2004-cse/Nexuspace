const channelService = require('../services/channelService');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Create a new channel
 * @route   POST /api/channels
 */
const createChannel = asyncHandler(async (req, res) => {
  const { name, workspaceId } = req.body;
  if (!name || !workspaceId) {
    res.status(400);
    throw new Error('Name and workspaceId are required');
  }

  const channel = await channelService.createChannelService(req.body, req.user._id);
  res.status(201).json(channel);
});

/**
 * @desc    Get all channels in a workspace
 * @route   GET /api/channels/:workspaceId
 */
const getWorkspaceChannels = asyncHandler(async (req, res) => {
  const channels = await channelService.getWorkspaceChannelsService(req.params.workspaceId);
  res.status(200).json(channels);
});

/**
 * @desc    Get channel details
 * @route   GET /api/channels/details/:id
 */
const getChannelDetails = asyncHandler(async (req, res) => {
  const channel = await channelService.getChannelDetailsService(req.params.id);
  res.status(200).json(channel);
});

/**
 * @desc    Update channel details
 * @route   PUT /api/channels/:id
 */
const updateChannel = asyncHandler(async (req, res) => {
  const channel = await channelService.updateChannelService(req.params.id, req.body, req.user._id);
  res.status(200).json(channel);
});

/**
 * @desc    Delete channel
 * @route   DELETE /api/channels/:id
 */
const deleteChannel = asyncHandler(async (req, res) => {
  const result = await channelService.deleteChannelService(req.params.id, req.user._id);
  res.status(200).json(result);
});

module.exports = { 
  createChannel,
  getWorkspaceChannels, 
  getChannelDetails,
  updateChannel,
  deleteChannel
};
