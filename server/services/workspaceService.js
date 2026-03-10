const Workspace = require('../models/Workspace');
const User = require('../models/User');

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

  return workspace;
};

module.exports = {
  createWorkspaceService,
  getWorkspacesService,
  addMemberService
};
