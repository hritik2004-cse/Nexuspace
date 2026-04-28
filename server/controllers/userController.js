const User = require('../models/User');
const Workspace = require('../models/Workspace');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Get user by ID
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password').lean();
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.status(200).json(user);
});

// @desc    Search users by name or username
const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    res.status(400);
    throw new Error('Search query is required');
  }

  const users = await User.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { username: { $regex: q, $options: 'i' } }
    ]
  }).select('name username avatar').lean();

  res.status(200).json(users);
});

// @desc    Update user profile
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Auth check: Own profile or Admin
  if (user._id.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const { name, username, avatar, password } = req.body;
  
  user.name = name || user.name;
  user.username = username || user.username;
  user.avatar = avatar || user.avatar;
  if (password) user.password = password;

  const updatedUser = await user.save();
  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    username: updatedUser.username,
    email: updatedUser.email,
    avatar: updatedUser.avatar,
    role: updatedUser.role
  });
});

// @desc    Delete user
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user._id.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  await user.deleteOne();
  res.status(200).json({ message: 'User deleted' });
});

// @desc    Get workspaces for a user
const getUserWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({ 'members.user': req.params.id }).lean();
  res.status(200).json(workspaces);
});

const { getOnlineUsers: getOnlineUserIds } = require('../sockets/workspaceSocket');

// @desc    Get all online users
// @route   GET /api/users/online
// @access  Private
const getOnlineUsers = asyncHandler(async (req, res) => {
  const onlineUserIds = getOnlineUserIds();
  const users = await User.find({ _id: { $in: onlineUserIds } }).select('name username avatar').lean();
  res.status(200).json(users);
});

module.exports = {
  getUserById,
  searchUsers,
  updateUser,
  deleteUser,
  getUserWorkspaces,
  getOnlineUsers
};
