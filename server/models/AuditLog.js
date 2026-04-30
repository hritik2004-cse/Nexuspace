const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['PIN_VERIFIED', 'PIN_FAILED', 'CHANNEL_LOCKED', 'PIN_CHANGED', 'SESSIONS_REVOKED', 'PIN_REMOVED', 'ROLE_UPDATED', 'MEMBER_REMOVED', 'OWNERSHIP_TRANSFERRED', 'CHANNEL_UPDATED', 'CHANNEL_DELETED', 'CHANNEL_LEFT'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  metadata: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
