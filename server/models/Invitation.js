const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  tokenHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true
  },
  inviterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired', 'consumed'],
    default: 'pending',
    index: true
  },
  maxUses: {
    type: Number,
    default: 1
  },
  usedCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// TTL Index for automatic cleanup of expired invitations
// Note: We still perform explicit expiresAt checks in queries
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for hot path lookups (atomic acceptance)
invitationSchema.index({ tokenHash: 1, status: 1, expiresAt: 1 });

module.exports = mongoose.model('Invitation', invitationSchema);
