const { asyncHandler } = require('../middleware/errorMiddleware');
const Notification = require('../models/Notification');
const crypto = require('crypto');

const generateIdempotencyKey = (recipient, entityId, type) => {
  return crypto.createHash('sha256').update(`${recipient}-${entityId}-${type}`).digest('hex');
};

const createNotification = async (recipient, type, entityId, io) => {
  const idempotencyKey = generateIdempotencyKey(recipient, entityId, type);
  
  // 5 minute bucket deduplication
  const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
  const existing = await Notification.findOne({
    idempotencyKey,
    createdAt: { $gte: fiveMinsAgo }
  });

  if (existing) return; // Deduplicate

  const notification = await Notification.create({
    recipient,
    type,
    entityId,
    idempotencyKey
  });

  if (io) {
    // Send to specific user using their Socket personal room
    io.to(recipient.toString()).emit('new_notification', notification);
  }
};

const getNotifications = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const cursor = req.query.cursor; // Last createdAt timestamp

  const query = { recipient: req.user._id };
  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(200).json(notifications);
});

const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Notification.findOneAndUpdate(
    { _id: id, recipient: req.user._id },
    { isRead: true }
  );
  res.status(200).json({ success: true });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );
  res.status(200).json({ success: true });
});

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead
};
