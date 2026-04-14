import bcrypt from 'bcryptjs';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function canManageRole(currentRole: string, targetRole: string) {
  const rank = { USER: 1, MODERATOR: 2, ADMIN: 3, OWNER: 4 } as const;
  return rank[currentRole as keyof typeof rank] > rank[targetRole as keyof typeof rank];
}
