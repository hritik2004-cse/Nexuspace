const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true, // Allows nulls for old users while enforcing uniqueness for new ones
    },
    password: {
      type: String,
      // Not required because Google OAuth users won't have a password
    },
    bio: {
      type: String,
      maxLength: 160,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
    },
    role: {
      type: String,
      enum: ["Admin", "Member"],
      default: "Member",
    },
    customTitle: {
      type: String,
      maxLength: 50,
      default: "Member",
    },
    sessionVersion: {
      type: Number,
      default: 0,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    channels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
      },
    ],
    phoneNumber: {
      type: String,
      default: "",
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneOtp: String,
    phoneOtpExpire: Date,
    theme: {
      type: String,
      default: "midnight",
    },
    lastRead: [
      {
        channelId: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" },
        lastReadAt: { type: Date, default: Date.now },
      },
    ],
    admin2faCode: String,
    admin2faExpire: Date,
  },


  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
