const Message = require('../models/Message');

/** Maximum character length for a chat message (V4/V12 fix) */
const MAX_CONTENT_LENGTH = 4000;

// @desc    Get all messages in a channel
// @route   GET /api/messages/:channelId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ channelId: req.params.channelId })
      .populate('sender', 'name avatar role username')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name username' }
      })
      .sort({ createdAt: 1 });
    
    // Convert reactions Map back to a clean object for React
    const formattedMessages = messages.map(msg => {
      const msgObj = msg.toObject({ flattenMaps: true });
      const reactionsFormatted = {};
      if (msgObj.reactions) {
        for (const [emoji, users] of Object.entries(msgObj.reactions)) {
          reactionsFormatted[emoji] = users.map(u => u.toString());
        }
      }
      return { ...msgObj, reactions: reactionsFormatted };
    });

    res.json(formattedMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new message
// @route   POST /api/messages
// @access  Private
const createMessage = async (req, res) => {
  try {
    const { content, channelId, attachments, replyTo, type, clientId } = req.body;

    // V4/V12: Validate content length before any processing
    if (!content && !attachments?.length) {
      return res.status(400).json({ message: 'Message content or attachment is required' });
    }
    if (content && content.length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({ message: `Message exceeds maximum length of ${MAX_CONTENT_LENGTH} characters` });
    }

    // clientId deduplication: if client sends a stable UUID, check for duplicate
    if (clientId) {
      const existing = await Message.findOne({ clientId, sender: req.user._id });
      if (existing) {
        // Idempotent: return the already-created message without re-inserting
        const populated = await existing.populate('sender', 'name avatar role username');
        return res.status(200).json(populated);
      }
    }

    const message = await Message.create({
      content,
      sender: req.user._id,
      channelId,
      attachments: attachments || [],
      replyTo: replyTo || null,
      type: type || 'text',
      ...(clientId ? { clientId } : {})
    });

    let populatedMessage = await message.populate('sender', 'name avatar role username');
    if (replyTo) {
      populatedMessage = await populatedMessage.populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name username' }
      });
    }
    
    // Broadcast via socket io attached to req
    const room = String(channelId).trim();
    const Channel = require('../models/Channel');
    const channel = await Channel.findById(channelId);
    
    const socketPayload = {
      ...populatedMessage.toObject(),
      channelName: channel ? channel.name : 'general'
    };

    console.log(`[Socket] Broadcasting message to channel room: "${room}"`);
    req.io.to(room).emit('receive_message', socketPayload);

    // Advanced Backend Mention & Reply Notifier logic
    // V12: Only run mention regex after confirming content is within safe length
    if (content && content.length <= MAX_CONTENT_LENGTH) {
      const User = require('../models/User');
      const Notification = require('../models/Notification');

      // 1. Handle Mentions
      const mentions = content.match(/@(\w+)/g);
      if (mentions) {
        const usernames = mentions.map(m => m.substring(1));
        const targetUsers = await User.find({ username: { $in: usernames } });
        
        for (const target of targetUsers) {
           if (target._id.toString() !== req.user._id.toString()) {
             await Notification.create({
               recipient: target._id,
               type: 'mention',
               entityId: message._id,
               idempotencyKey: `mention_${message._id}_${target._id}`,
               content: `${req.user.name} mentioned you in #${socketPayload.channelName}`,
               senderDetails: {
                 name: req.user.name,
                 avatar: req.user.avatar
               }
             });

             req.io.to(target._id.toString()).emit('receive_notification', `${req.user.name} mentioned you in #${socketPayload.channelName}`);
           }
        }
      }

      // 2. Handle Reply Notification
      if (replyTo) {
        const originalMessage = await Message.findById(replyTo);
        if (originalMessage && originalMessage.sender.toString() !== req.user._id.toString()) {
          const recipientId = originalMessage.sender.toString();
          
          await Notification.create({
            recipient: recipientId,
            type: 'reply',
            entityId: message._id,
            idempotencyKey: `reply_${message._id}_${recipientId}`,
            content: `${req.user.name} replied to your message in #${socketPayload.channelName}`,
            senderDetails: {
              name: req.user.name,
              avatar: req.user.avatar
            }
          });

          req.io.to(recipientId).emit('receive_notification', `${req.user.name} replied to your message in #${socketPayload.channelName}`);
        }
      }
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    React to a message
// @route   PUT /api/messages/:id/react
// @access  Private
const reactToMessage = async (req, res) => {
  try {
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    let currentReacts = message.reactions.get(emoji) || [];
    
    // Toggle logic: If user already reacted, remove them. Otherwise, add.
    const hasReacted = currentReacts.some(id => id.toString() === userId.toString());
    
    if (hasReacted) {
      currentReacts = currentReacts.filter(id => id.toString() !== userId.toString());
      if (currentReacts.length === 0) {
        message.reactions.delete(emoji);
      } else {
        message.reactions.set(emoji, currentReacts);
      }
    } else {
      currentReacts.push(userId);
      message.reactions.set(emoji, currentReacts);
    }

    await message.save();

    res.json({ messageId: message._id, reactions: message.reactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Pin or unpin a message
// @route   PUT /api/messages/:id/pin
// @access  Private (Admin Only via middleware)
const togglePinMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    message.isPinned = !message.isPinned;
    await message.save();

    res.json({ messageId: message._id, isPinned: message.isPinned });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Edit a message
// @route   PUT /api/messages/:id
// @access  Private
const editMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    
    if (message.sender.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }
    
    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();


    // Broadcast edit to all users in the channel
    req.io.to(message.channelId.toString()).emit('message_edited', {
      messageId: message._id,
      content: message.content,
      isEdited: true
    });

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    // Only the sender or a global Admin can delete
    if (message.sender.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    const channelId = message.channelId.toString();
    const messageId = message._id.toString();

    await Message.deleteOne({ _id: req.params.id });

    // Broadcast deletion to ALL users in the channel room in real-time
    req.io.to(channelId).emit('message_deleted', { messageId });

    res.status(200).json({ message: 'Message deleted', messageId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getMessages, createMessage, reactToMessage, togglePinMessage, deleteMessage, editMessage };

