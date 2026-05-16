import type { Role } from '@prisma/client';

const roleRank: Record<Role, number> = {
  USER: 1,
  MODERATOR: 2,
  ADMIN: 3,
  OWNER: 4
};

export function canAccessAdmin(role: Role) {
  return role === 'OWNER' || role === 'ADMIN' || role === 'MODERATOR';
}

export function canManageContent(role: Role) {
  return role === 'OWNER' || role === 'ADMIN';
}

export function canManageRole(currentRole: Role, targetRole: Role) {
  return roleRank[currentRole] > roleRank[targetRole];
}

export function canManageUser(currentRole: Role, targetRole: Role) {
  return roleRank[currentRole] > roleRank[targetRole];
}
