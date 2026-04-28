const Message = require('../models/Message');

/**
 * @desc    Get messages for a channel
 */
const getMessagesService = async (channelId) => {
  const messages = await Message.find({ channelId })
    .populate('sender', 'name avatar role username')
    .sort({ createdAt: 1 })
    .lean();
  
  return messages.map(msg => ({
    ...msg,
    reactions: msg.reactions ? Object.fromEntries(msg.reactions) : {}
  }));
};

/**
 * @desc    Create a new message
 */
const createMessageService = async (data, senderId) => {
  const message = await Message.create({
    ...data,
    sender: senderId
  });
  return await message.populate('sender', 'name avatar role username');
};

/**
 * @desc    Delete message
 */
const deleteMessageService = async (messageId, userId) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error('Message not found');

  if (message.sender.toString() !== userId.toString()) {
    throw new Error('Not authorized to delete this message');
  }

  await message.deleteOne();
  return { messageId };
};

/**
 * @desc    Add reaction
 */
const addReactionService = async (messageId, emoji, userId) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error('Message not found');

  let currentReacts = message.reactions.get(emoji) || [];
  if (!currentReacts.some(id => id.toString() === userId.toString())) {
    currentReacts.push(userId);
    message.reactions.set(emoji, currentReacts);
    await message.save();
  }
  
  return { messageId, reactions: Object.fromEntries(message.reactions) };
};

/**
 * @desc    Remove reaction
 */
const removeReactionService = async (messageId, emoji, userId) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error('Message not found');

  let currentReacts = message.reactions.get(emoji) || [];
  const filteredReacts = currentReacts.filter(id => id.toString() !== userId.toString());
  
  if (filteredReacts.length === 0) {
    message.reactions.delete(emoji);
  } else {
    message.reactions.set(emoji, filteredReacts);
  }

  await message.save();
  return { messageId, reactions: Object.fromEntries(message.reactions) };
};

/**
 * @desc    Pin message
 */
const pinMessageService = async (messageId) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error('Message not found');

  message.isPinned = true;
  await message.save();
  return { messageId, isPinned: true };
};

/**
 * @desc    Unpin message
 */
const unpinMessageService = async (messageId) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error('Message not found');

  message.isPinned = false;
  await message.save();
  return { messageId, isPinned: false };
};

/**
 * @desc    Search messages
 */
const searchMessagesService = async (query) => {
  return await Message.find({ content: { $regex: query, $options: 'i' } })
    .populate('sender', 'name avatar username')
    .populate('channelId', 'name')
    .sort({ createdAt: -1 })
    .lean();
};

module.exports = {
  getMessagesService,
  createMessageService,
  deleteMessageService,
  addReactionService,
  removeReactionService,
  pinMessageService,
  unpinMessageService,
  searchMessagesService
};
