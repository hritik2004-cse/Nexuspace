const Workspace = require('../models/Workspace');
const User = require('../models/User');

/**
 * @private Helper to check if a user is an Admin in a workspace
 */
const checkAdminStatus = async (workspaceId, userId) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new Error('Workspace not found');
  
  const member = workspace.members.find(m => m.user.toString() === userId.toString());
  if (!member || member.role !== 'Admin') {
    throw new Error('Not authorized: Requires Workspace Admin role');
  }
  return workspace;
};

const createWorkspaceService = async (name, ownerId) => {
  if (await Workspace.exists({ name })) {
    throw new Error('Workspace name already exists');
  }

  return Workspace.create({
    name,
    owner: ownerId,
    members: [{ user: ownerId, role: 'Admin' }]
  });
};

const getWorkspacesService = async (userId) => {
  return Workspace.find({ 'members.user': userId })
    .populate('owner', 'name email avatar')
    .lean();
};

const getWorkspaceByIdService = async (workspaceId) => {
  const workspace = await Workspace.findById(workspaceId)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar username')
    .lean();
  if (!workspace) throw new Error('Workspace not found');
  return workspace;
};

const addMemberService = async (workspaceId, memberEmail, ownerId) => {
  const workspace = await checkAdminStatus(workspaceId, ownerId);

  const userToAdd = await User.findOne({ email: memberEmail });
  if (!userToAdd) throw new Error('User not found');

  if (workspace.members.some(m => m.user.toString() === userToAdd._id.toString())) {
    throw new Error('User is already a member');
  }

  workspace.members.push({ user: userToAdd._id, role: 'Member' });
  return workspace.save();
};

const updateWorkspaceService = async (workspaceId, name, ownerId) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new Error('Workspace not found');
  if (workspace.owner.toString() !== ownerId.toString()) throw new Error('Only owner can modify workspace name');

  workspace.name = name || workspace.name;
  return workspace.save();
};

const deleteWorkspaceService = async (workspaceId, ownerId) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new Error('Workspace not found');
  if (workspace.owner.toString() !== ownerId.toString()) throw new Error('Only owner can delete workspace');

  await workspace.deleteOne();
  return { message: 'Workspace deleted successfully' };
};

const updateMemberRoleService = async (workspaceId, userId, role, requesterId) => {
  const workspace = await checkAdminStatus(workspaceId, requesterId);

  const member = workspace.members.find(m => m.user.toString() === userId.toString());
  if (!member) throw new Error('Member not found in workspace');

  member.role = role;
  return workspace.save();
};

const removeMemberService = async (workspaceId, userId, requesterId) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new Error('Workspace not found');

  const requester = workspace.members.find(m => m.user.toString() === requesterId.toString());
  const isSelf = userId.toString() === requesterId.toString();

  if (!requester || (requester.role !== 'Admin' && !isSelf)) {
    throw new Error('Not authorized to remove member');
  }

  if (workspace.owner.toString() === userId.toString()) {
    throw new Error('Owner cannot leave/be removed. Transfer ownership first.');
  }

  workspace.members = workspace.members.filter(m => m.user.toString() !== userId.toString());
  return workspace.save();
};

const joinWorkspaceService = async (workspaceId, userId) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new Error('Workspace not found');

  if (workspace.members.some(m => m.user.toString() === userId.toString())) {
    throw new Error('User is already a member of this workspace');
  }

  workspace.members.push({ user: userId, role: 'Member' });
  return workspace.save();
};

module.exports = {
  createWorkspaceService,
  getWorkspacesService,
  addMemberService,
  getWorkspaceByIdService,
  updateWorkspaceService,
  deleteWorkspaceService,
  updateMemberRoleService,
  removeMemberService,
  joinWorkspaceService
};
