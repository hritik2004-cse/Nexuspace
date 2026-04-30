const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' }
  }],

  pinHash: {
    type: String,
    default: null
  },
  pinUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure channel names are unique within a workspace
channelSchema.index({ name: 1, workspaceId: 1 }, { unique: true });

module.exports = mongoose.model('Channel', channelSchema);
