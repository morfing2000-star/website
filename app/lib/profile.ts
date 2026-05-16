import { prisma } from '@/app/lib/prisma';

export async function getPrimaryProfile(userId: string) {
  const existing = await prisma.profile.findFirst({ where: { userId }, orderBy: { id: 'asc' } });
  if (existing) return existing;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  return prisma.profile.create({
    data: {
      userId,
      displayName: user.email.split('@')[0]
    }
  });
}
