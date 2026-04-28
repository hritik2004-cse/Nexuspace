const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Get user notifications
 */
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('sender', 'name avatar username')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(notifications);
});

/**
 * @desc    Mark a specific notification as read
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  ).lean();

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found or unauthorized');
  }

  res.status(200).json(notification);
});

/**
 * @desc    Delete a notification
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found or unauthorized');
  }

  res.status(200).json({ success: true, message: 'Notification deleted' });
});

/**
 * @desc    Mark all user notifications as read
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({ success: true, message: 'All marked as read' });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
