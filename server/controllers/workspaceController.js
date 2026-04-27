const { asyncHandler } = require('../middleware/errorMiddleware');
const workspaceService = require('../services/workspaceService');

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
  const workspace = await workspaceService.joinWorkspaceService(workspaceId, req.user._id);
  res.status(200).json(workspace);
});

module.exports = {
  createWorkspace,
  getWorkspaces,
  addMember,
  joinWorkspace
};
