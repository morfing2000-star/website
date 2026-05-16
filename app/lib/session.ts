import { cookies } from 'next/headers';
import { prisma } from '@/app/lib/prisma';

export async function getCurrentUser() {
  const token = cookies().get('anivex_session')?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } }).catch(() => null);
    return null;
  }

  if (session.user.isBanned) return null;
  if (session.user.banExpiresAt && session.user.banExpiresAt < new Date()) {
    return prisma.user.update({
      where: { id: session.user.id },
      data: { isBanned: false, banExpiresAt: null }
    });
  }

  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}
