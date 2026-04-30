const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Channel = require('../models/Channel');

const createWorkspaceService = async (name, ownerId) => {
  const workspaceExists = await Workspace.findOne({ name });

  if (workspaceExists) {
    throw new Error('Workspace name already exists');
  }

  const workspace = await Workspace.create({
    name,
    owner: ownerId,
    members: [ownerId]
  });

  // Create general channel for the new workspace
  await Channel.create({
    name: 'general',
    workspaceId: workspace._id,
    creator: ownerId,
    owner: ownerId,
    members: [{ user: ownerId, role: 'owner' }]
  });

  return workspace;
};

const getWorkspacesService = async (userId) => {
  const workspaces = await Workspace.find({ members: userId }).populate('owner', 'name email avatar');
  return workspaces;
};

const addMemberService = async (workspaceId, memberEmail, ownerId) => {
  const workspace = await Workspace.findById(workspaceId);
  
  if (!workspace) throw new Error('Workspace not found');
  if (workspace.owner.toString() !== ownerId.toString()) throw new Error('Not authorized to add members');

  const userToAdd = await User.findOne({ email: memberEmail });
  if (!userToAdd) throw new Error('User not found');

  if (workspace.members.includes(userToAdd._id)) {
    throw new Error('User is already a member');
  }

  workspace.members.push(userToAdd._id);
  await workspace.save();

  // Add user to the general channel of this workspace
  await Channel.findOneAndUpdate(
    { workspaceId, name: 'general' },
    { $addToSet: { members: { user: userToAdd._id, role: 'member' } } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return workspace;
};

const joinWorkspaceService = async (workspaceId, userId) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new Error('Workspace not found');
  
  if (!workspace.members.includes(userId)) {
    workspace.members.push(userId);
    await workspace.save();

    // Add user to the general channel of this workspace
    await Channel.findOneAndUpdate(
      { workspaceId, name: 'general' },
      { $addToSet: { members: { user: userId, role: 'member' } } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  return workspace;
};

module.exports = {
  createWorkspaceService,
  getWorkspacesService,
  addMemberService,
  joinWorkspaceService
};
