import bcrypt from 'bcryptjs';
import type { Role } from '@prisma/client';
import { canManageRole as canManageRoleByRank } from '@/app/lib/roles';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function canManageRole(currentRole: Role, targetRole: Role) {
  return canManageRoleByRank(currentRole, targetRole);
}
