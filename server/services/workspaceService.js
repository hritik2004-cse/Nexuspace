const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Channel = require('../models/Channel');
const Invitation = require('../models/Invitation');
const crypto = require('crypto');
const IdempotencyService = require('./idempotencyService');

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
  // Use idempotency for join operations
  const idempKey = IdempotencyService.generateKey('join', userId, { workspaceId });
  
  return IdempotencyService.run(idempKey, async () => {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new Error('Workspace not found');
    
    // Atomically add member to workspace
    await Workspace.updateOne(
      { _id: workspaceId },
      { $addToSet: { members: userId } }
    );

    // Atomically add user to the general channel of this workspace
    await Channel.updateOne(
      { workspaceId, name: 'general' },
      { $addToSet: { members: { user: userId, role: 'member' } } }
    );

    return { success: true, workspaceId };
  });
};

const createInvitationService = async (workspaceId, inviterId, email, maxUses = 1) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new Error('Workspace not found');

  // Generate long secure token
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const invitation = await Invitation.create({
    tokenHash,
    workspaceId,
    inviterId,
    email,
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    maxUses
  });

  return { token, invitation };
};

const getInvitationByTokenService = async (token) => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  // Always check expiresAt explicitly to avoid TTL lag issues
  const invitation = await Invitation.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() }
  }).populate('workspaceId', 'name').populate('inviterId', 'name avatar');

  if (!invitation) {
    throw new Error('Invitation expired or invalid');
  }

  return invitation;
};

const acceptInvitationService = async (token, userId) => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  // God Mode: Atomic Pipeline Update
  // We use nextUsed to compute status atomically and check maxUses
  const invite = await Invitation.findOneAndUpdate(
    {
      tokenHash,
      status: 'pending',
      expiresAt: { $gt: new Date(Date.now() - 2000) }, // 2s grace window
      $expr: { $lt: ['$usedCount', '$maxUses'] }
    },
    [
      { $set: { nextUsed: { $add: ['$usedCount', 1] } } },
      {
        $set: {
          usedCount: '$nextUsed',
          status: {
            $cond: [{ $gte: ['$nextUsed', '$maxUses'] }, 'consumed', 'pending']
          }
        }
      },
      { $unset: 'nextUsed' }
    ],
    { 
      new: true,
      writeConcern: { w: 'majority' },
      readConcern: { level: 'majority' }
    }
  );

  if (!invite) {
    throw new Error('Invitation invalid, expired, or already consumed');
  }

  // Perform the join (re-using joinWorkspaceService logic or calling it)
  await joinWorkspaceService(invite.workspaceId, userId);

  return { success: true, workspaceId: invite.workspaceId };
};

module.exports = {
  createWorkspaceService,
  getWorkspacesService,
  addMemberService,
  joinWorkspaceService,
  createInvitationService,
  getInvitationByTokenService,
  acceptInvitationService
};
