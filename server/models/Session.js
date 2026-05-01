const mongoose = require('mongoose');
const crypto = require('crypto');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  jti: {
    type: String, // current token ID
    required: true
  },
  currentTokenHash: {
    type: String,
    required: true,
  },
  userAgent: String,
  ip: String,
  expiresAt: {
    type: Date,
    required: true,
  },
  revokedAt: {
    type: Date
  },
  isAdmin2FAVerified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });


// TTL index to automatically remove expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Helper to hash refresh tokens with pepper
sessionSchema.statics.hashToken = function(token) {
  const pepper = process.env.TOKEN_PEPPER || 'default-pepper-secret';
  const hmac = crypto.createHmac('sha256', pepper).update(token).digest('hex');
  // Return standard bcrypt isn't necessary here since HMAC+hex is constant and secure
  // but if we want to add bcrypt, we could. The plan says HMAC + bcrypt.
  // Actually, bcrypt is slow. HMAC with a strong pepper is secure for random tokens.
  // We will just use HMAC for fast hashing. Let's stick to the plan: HMAC + bcrypt.
  const bcrypt = require('bcryptjs');
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(hmac, salt);
};

sessionSchema.statics.verifyToken = async function(token, hash) {
  const pepper = process.env.TOKEN_PEPPER || 'default-pepper-secret';
  const hmac = crypto.createHmac('sha256', pepper).update(token).digest('hex');
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(hmac, hash);
};

module.exports = mongoose.model('Session', sessionSchema);
