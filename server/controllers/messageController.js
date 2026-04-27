const Message = require('../models/Message');

// @desc    Get all messages in a channel
// @route   GET /api/messages/:channelId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ channelId: req.params.channelId })
      .populate('sender', 'name avatar role username')
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
    const { content, channelId, attachments } = req.body;

    const message = await Message.create({
      content,
      sender: req.user._id,
      channelId,
      attachments: attachments || []
    });

    const populatedMessage = await message.populate('sender', 'name avatar role username');
    
    // Broadcast via socket io attached to req
    const room = String(channelId).trim();
    console.log(`[Socket] Broadcasting message to channel room: "${room}"`);
    req.io.to(room).emit('receive_message', populatedMessage);

    // Advanced Backend Mention Notifier logic
    if (content) {
      const mentions = content.match(/@(\w+)/g);
      if (mentions) {
        const usernames = mentions.map(m => m.substring(1));
        const User = require('../models/User');
        const Notification = require('../models/Notification');
        const targetUsers = await User.find({ username: { $in: usernames } });
        
        for (const target of targetUsers) {
           if (target._id.toString() !== req.user._id.toString()) {
             // Create notification document
             await Notification.create({
               recipient: target._id,
               type: 'mention',
               entityId: message._id,
               idempotencyKey: `mention_${message._id}_${target._id}`,
               content: `${req.user.name} mentioned you in #${channelId}`,
               senderDetails: {
                 name: req.user.name,
                 avatar: req.user.avatar
               }
             });

             req.io.to(target._id.toString()).emit('receive_notification', `${req.user.name} mentioned you in a channel!`);
           }
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

module.exports = { getMessages, createMessage, reactToMessage, togglePinMessage };
