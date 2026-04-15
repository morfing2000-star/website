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
  if (session.expiresAt < new Date()) return null;

  return session.user;
}
