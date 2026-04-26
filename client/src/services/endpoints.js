import api from "./api";

export const API_ENDPOINTS = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    google: "/auth/google",
  },
  workspaces: {
    base: "/workspaces",
    members: (workspaceId) => `/workspaces/${workspaceId}/members`,
  },
  tasks: {
    base: "/tasks",
    byBoard: (boardId) => `/tasks/${boardId}`,
    byId: (taskId) => `/tasks/${taskId}`,
  },
  channels: {
    findOrCreate: "/channels/findOrCreate",
  },
  messages: {
    base: "/messages",
    byChannel: (channelId) => `/messages/${channelId}`,
    react: (messageId) => `/messages/${messageId}/react`,
    pin: (messageId) => `/messages/${messageId}/pin`,
  },
};

export const authApi = {
  googleLogin: (credential) =>
    api.post(API_ENDPOINTS.auth.google, { credential }),
  login: (email, password) =>
    api.post(API_ENDPOINTS.auth.login, { email, password }),
  register: (name, email, password) =>
    api.post(API_ENDPOINTS.auth.register, { name, email, password }),
};

export const taskApi = {
  getByBoard: (boardId) => api.get(API_ENDPOINTS.tasks.byBoard(boardId)),
  create: (payload) => api.post(API_ENDPOINTS.tasks.base, payload),
  update: (taskId, payload) =>
    api.put(API_ENDPOINTS.tasks.byId(taskId), payload),
  remove: (taskId) => api.delete(API_ENDPOINTS.tasks.byId(taskId)),
};

export const workspaceApi = {
  list: () => api.get(API_ENDPOINTS.workspaces.base),
  create: (payload) => api.post(API_ENDPOINTS.workspaces.base, payload),
  addMember: (workspaceId, payload) =>
    api.post(API_ENDPOINTS.workspaces.members(workspaceId), payload),
};

export const channelApi = {
  findOrCreate: (payload) =>
    api.post(API_ENDPOINTS.channels.findOrCreate, payload),
};

export const messageApi = {
  list: (channelId) => api.get(API_ENDPOINTS.messages.byChannel(channelId)),
  create: (payload) => api.post(API_ENDPOINTS.messages.base, payload),
  react: (messageId, payload) =>
    api.put(API_ENDPOINTS.messages.react(messageId), payload),
  pin: (messageId) => api.put(API_ENDPOINTS.messages.pin(messageId)),
};
