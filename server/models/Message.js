const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  reactions: {
    type: Map,
    of: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    default: new Map()
  },
  attachments: [{
    url: String,
    type: { type: String }, // 'image', 'file', etc.
    name: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
