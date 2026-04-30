const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['mention', 'message', 'task', 'reply', 'channel_invite'],
    required: true,
  },

  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  senderDetails: {
    name: String,
    avatar: String
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  idempotencyKey: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// TTL Index: Delete after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Compound Indexes for fast queries and deduplication
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ idempotencyKey: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
