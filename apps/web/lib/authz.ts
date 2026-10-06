export const USER_ROLES = [
  "GUEST",
  "READER",
  "CONTRIBUTOR",
  "TRANSLATOR",
  "RESEARCHER",
  "EDITOR",
  "MODERATOR",
  "ADMIN",
  "SUPER_ADMIN",
] as const;

export type UserRoleName = (typeof USER_ROLES)[number];

export const PERMISSIONS = [
  "content.read",
  "content.create",
  "content.edit",
  "content.review",
  "content.publish",
  "content.delete",
  "dictionary.read",
  "dictionary.edit",
  "media.create",
  "media.edit",
  "media.delete",
  "user.read",
  "user.edit",
  "user.suspend",
  "role.assign",
  "comment.moderate",
  "source.manage",
  "license.manage",
  "audit.read",
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number];

export type UserRole = {
  id: string;
  name: UserRoleName;
  description: string | null;
};

export type Permission = {
  id: string;
  key: PermissionKey;
  description: string | null;
};

export function hasRole(roles: UserRole[], role: UserRoleName) {
  return roles.some((item) => item.name === role);
}

export function hasAnyRole(roles: UserRole[], required: UserRoleName[]) {
  return required.some((role) => hasRole(roles, role));
}

export function hasPermission(permissions: Permission[], permission: PermissionKey) {
  return permissions.some((item) => item.key === permission);
}

export function hasAnyPermission(permissions: Permission[], required: PermissionKey[]) {
  return required.some((permission) => hasPermission(permissions, permission));
}

export function canAccessDashboard(roles: UserRole[]) {
  return roles.length > 0;
}

export function canAccessAdmin(permissions: Permission[]) {
  return hasAnyPermission(permissions, [
    "user.read",
    "user.edit",
    "user.suspend",
    "role.assign",
    "source.manage",
    "license.manage",
    "audit.read",
  ]);
}
