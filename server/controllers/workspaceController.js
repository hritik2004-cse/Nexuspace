const { asyncHandler } = require('../middleware/errorMiddleware');
const workspaceService = require('../services/workspaceService');
const crypto = require('crypto');

const createWorkspace = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Please enter a workspace name');
  }

  const workspace = await workspaceService.createWorkspaceService(name, req.user._id);
  res.status(201).json(workspace);
});

const getWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await workspaceService.getWorkspacesService(req.user._id);
  res.status(200).json(workspaces);
});

const addMember = asyncHandler(async (req, res) => {
  const { memberEmail } = req.body;
  const { workspaceId } = req.params;

  if (!memberEmail) {
    res.status(400);
    throw new Error('Please provide the email of the member to add');
  }

  const workspace = await workspaceService.addMemberService(workspaceId, memberEmail, req.user._id);
  res.status(200).json(workspace);
});

const joinWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const result = await workspaceService.joinWorkspaceService(workspaceId, req.user._id);
  res.status(200).json({ success: true, ...result, requestId: crypto.randomUUID() });
});

const createInvitation = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { email, maxUses } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email for the invitation');
  }

  const result = await workspaceService.createInvitationService(workspaceId, req.user._id, email, maxUses);
  res.status(201).json({ success: true, ...result, requestId: crypto.randomUUID() });
});

const getInvitation = asyncHandler(async (req, res) => {
  const { token } = req.params;

  try {
    const invitation = await workspaceService.getInvitationByTokenService(token);
    res.status(200).json({ success: true, invitation, requestId: crypto.randomUUID() });
  } catch (error) {
    if (error.message.includes('expired') || error.message.includes('invalid')) {
      res.status(410).json({ 
        success: false, 
        code: 'INVITE_EXPIRED', 
        message: 'This invitation has expired or is no longer valid', 
        retryable: false,
        requestId: crypto.randomUUID()
      });
    } else {
      throw error;
    }
  }
});

const acceptInvitation = asyncHandler(async (req, res) => {
  const { token } = req.params;

  try {
    const result = await workspaceService.acceptInvitationService(token, req.user._id);
    res.status(200).json({ success: true, ...result, requestId: crypto.randomUUID() });
  } catch (error) {
    if (error.message.includes('consumed') || error.message.includes('expired')) {
      res.status(410).json({ 
        success: false, 
        code: 'INVITE_UNAVAILABLE', 
        message: error.message, 
        retryable: false,
        requestId: crypto.randomUUID()
      });
    } else {
      res.status(400).json({
        success: false,
        code: 'INVITE_ERROR',
        message: error.message,
        retryable: true,
        requestId: crypto.randomUUID()
      });
    }
  }
});

module.exports = {
  createWorkspace,
  getWorkspaces,
  addMember,
  joinWorkspace,
  createInvitation,
  getInvitation,
  acceptInvitation
};
