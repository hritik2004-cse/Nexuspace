const workspaceService = require('../services/workspaceService');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Create a new workspace
 * @route   POST /api/workspaces
 */
const createWorkspace = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Workspace name is required');
  }

  const workspace = await workspaceService.createWorkspaceService(name, req.user._id);
  res.status(201).json(workspace);
});

/**
 * @desc    Get all workspaces for logged in user
 * @route   GET /api/workspaces
 */
const getWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await workspaceService.getWorkspacesService(req.user._id);
  res.status(200).json(workspaces);
});

/**
 * @desc    Add member to workspace (Internal/Legacy)
 */
const addMember = asyncHandler(async (req, res) => {
  const { memberEmail } = req.body;
  const { workspaceId } = req.params;

  const workspace = await workspaceService.addMemberService(workspaceId, memberEmail, req.user._id);
  res.status(200).json(workspace);
});

/**
 * @desc    Get workspace by ID
 * @route   GET /api/workspaces/:workspaceId
 */
const getWorkspaceById = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.getWorkspaceByIdService(req.params.workspaceId);
  res.status(200).json(workspace);
});

/**
 * @desc    Update workspace details
 * @route   PUT /api/workspaces/:workspaceId
 */
const updateWorkspace = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const workspace = await workspaceService.updateWorkspaceService(req.params.workspaceId, name, req.user._id);
  res.status(200).json(workspace);
});

/**
 * @desc    Delete workspace
 * @route   DELETE /api/workspaces/:workspaceId
 */
const deleteWorkspace = asyncHandler(async (req, res) => {
  const result = await workspaceService.deleteWorkspaceService(req.params.workspaceId, req.user._id);
  res.status(200).json(result);
});

/**
 * @desc    Invite member to workspace
 */
const inviteWorkspace = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const workspace = await workspaceService.addMemberService(req.params.workspaceId, email, req.user._id);
  res.status(200).json(workspace);
});

/**
 * @desc    Join workspace
 */
const joinWorkspace = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.joinWorkspaceService(req.params.workspaceId, req.user._id);
  res.status(200).json(workspace);
});

/**
 * @desc    Get workspace members
 */
const getWorkspaceMembers = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.getWorkspaceByIdService(req.params.workspaceId);
  res.status(200).json(workspace.members);
});

/**
 * @desc    Update member role
 */
const updateMemberRole = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;
  const workspace = await workspaceService.updateMemberRoleService(req.params.workspaceId, userId, role, req.user._id);
  res.status(200).json(workspace);
});

/**
 * @desc    Remove member
 */
const removeMember = asyncHandler(async (req, res) => {
  const { workspaceId, userId } = req.params;
  const workspace = await workspaceService.removeMemberService(workspaceId, userId, req.user._id);
  res.status(200).json(workspace);
});

module.exports = {
  createWorkspace,
  getWorkspaces,
  addMember,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  inviteWorkspace,
  joinWorkspace,
  getWorkspaceMembers,
  updateMemberRole,
  removeMember
};
