const messageService = require('../services/messageService');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Get messages for a channel
 * @route   GET /api/messages/:channelId
 */
const getMessages = asyncHandler(async (req, res) => {
  const messages = await messageService.getMessagesService(req.params.channelId);
  res.status(200).json(messages);
});

/**
 * @desc    Create a new message
 * @route   POST /api/messages
 */
const createMessage = asyncHandler(async (req, res) => {
  const { content, channelId } = req.body;
  if (!content || !channelId) {
    res.status(400);
    throw new Error('Content and channelId are required');
  }

  const message = await messageService.createMessageService(req.body, req.user._id);
  
  if (req.io) {
    req.io.to(channelId).emit('receive_message', message);
  }

  res.status(201).json(message);
});

/**
 * @desc    Delete message
 * @route   DELETE /api/messages/:id
 */
const deleteMessage = asyncHandler(async (req, res) => {
  const result = await messageService.deleteMessageService(req.params.id, req.user._id);
  res.status(200).json(result);
});

/**
 * @desc    Add reaction
 * @route   POST /api/messages/:id/react
 */
const addReaction = asyncHandler(async (req, res) => {
  const { emoji } = req.body;
  const result = await messageService.addReactionService(req.params.id, emoji, req.user._id);
  res.status(200).json(result);
});

/**
 * @desc    Remove reaction
 * @route   DELETE /api/messages/:id/react
 */
const removeReaction = asyncHandler(async (req, res) => {
  const { emoji } = req.body;
  const result = await messageService.removeReactionService(req.params.id, emoji, req.user._id);
  res.status(200).json(result);
});

/**
 * @desc    Pin message
 * @route   POST /api/messages/:id/pin
 */
const pinMessage = asyncHandler(async (req, res) => {
  const result = await messageService.pinMessageService(req.params.id);
  res.status(200).json(result);
});

/**
 * @desc    Unpin message
 * @route   DELETE /api/messages/:id/pin
 */
const unpinMessage = asyncHandler(async (req, res) => {
  const result = await messageService.unpinMessageService(req.params.id);
  res.status(200).json(result);
});

/**
 * @desc    Search messages
 * @route   GET /api/messages/search
 */
const searchMessages = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const messages = await messageService.searchMessagesService(q);
  res.status(200).json(messages);
});

module.exports = {
  getMessages,
  createMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  pinMessage,
  unpinMessage,
  searchMessages
};
