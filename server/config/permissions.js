const roles = {
  Admin: [
    'workspace:create',
    'workspace:delete',
    'workspace:read',
    'channel:create',
    'channel:delete',
    'channel:read',
    'message:create',
    'message:delete',
    'message:read',
    'task:create',
    'task:delete',
    'task:read',
    'user:manage'
  ],
  Member: [
    'workspace:read',
    'channel:read',
    'message:create',
    'message:read',
    'task:create',
    'task:read',
  ]
};

const hasPermission = (role, permission) => {
  if (!roles[role]) return false;
  return roles[role].includes(permission);
};

module.exports = {
  roles,
  hasPermission
};
