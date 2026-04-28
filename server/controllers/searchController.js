const Message = require('../models/Message');
const Task = require('../models/Task');
const User = require('../models/User');
const Channel = require('../models/Channel');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Global unified search (Users, Messages, Tasks, Channels)
 * @route   GET /api/search
 */
const searchAll = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    res.status(400);
    throw new Error('Search query is required');
  }

  const regex = { $regex: query, $options: 'i' };

  // Parallel search across all entities
  const [users, messages, tasks, channels] = await Promise.all([
    User.find({
      $or: [{ name: regex }, { username: regex }]
    }).select('name username avatar').limit(10).lean(),

    Message.find({ content: regex })
      .populate('sender', 'name username avatar')
      .populate('channelId', 'name')
      .limit(20)
      .lean(),

    Task.find({
      $or: [{ title: regex }, { description: regex }]
    }).populate('assignee', 'name username avatar').limit(10).lean(),

    Channel.find({ name: regex }).limit(10).lean()
  ]);

  res.status(200).json({
    users,
    messages,
    tasks,
    channels
  });
});

module.exports = { searchAll };
