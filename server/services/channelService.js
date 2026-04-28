const Channel = require('../models/Channel');

/**
 * @desc    Get channels for a workspace
 */
const getWorkspaceChannelsService = async (workspaceId) => {
  return await Channel.find({ workspaceId })
    .populate('creator', 'name username avatar')
    .sort({ createdAt: 1 })
    .lean();
};

/**
 * @desc    Create a new channel
 */
const createChannelService = async (data, creatorId) => {
  return await Channel.create({
    ...data,
    creator: creatorId,
    members: [creatorId]
  });
};

/**
 * @desc    Get channel details
 */
const getChannelDetailsService = async (channelId) => {
  const channel = await Channel.findById(channelId)
    .populate('creator', 'name username avatar')
    .populate('members', 'name username avatar')
    .lean();
  
  if (!channel) throw new Error('Channel not found');
  return channel;
};

/**
 * @desc    Update channel
 */
const updateChannelService = async (channelId, data, userId) => {
  const channel = await Channel.findById(channelId);
  if (!channel) throw new Error('Channel not found');

  if (channel.creator.toString() !== userId.toString()) {
    throw new Error('Not authorized to update this channel');
  }

  channel.name = data.name || channel.name;
  channel.isPrivate = data.isPrivate !== undefined ? data.isPrivate : channel.isPrivate;
  
  await channel.save();
  return channel;
};

/**
 * @desc    Delete channel
 */
const deleteChannelService = async (channelId, userId) => {
  const channel = await Channel.findById(channelId);
  if (!channel) throw new Error('Channel not found');

  if (channel.creator.toString() !== userId.toString()) {
    throw new Error('Not authorized to delete this channel');
  }

  await channel.deleteOne();
  return { message: 'Channel deleted successfully' };
};

module.exports = {
  getWorkspaceChannelsService,
  createChannelService,
  getChannelDetailsService,
  updateChannelService,
  deleteChannelService
};
