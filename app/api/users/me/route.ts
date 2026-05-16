import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profile = await prisma.profile.findFirst({
    where: { userId: user.id },
    include: {
      favorites: { include: { anime: true } },
      watchHistory: { include: { anime: true, episode: true }, orderBy: { updatedAt: 'desc' } },
      ratings: { include: { anime: true } }
    }
  });

  return NextResponse.json({
    profile: {
      id: profile?.id ?? null,
      email: user.email,
      role: user.role,
      avatar: user.avatarUrl ?? '/anivex-logo.svg',
      bio: user.bio,
      watchHistory: profile?.watchHistory ?? [],
      favorites: profile?.favorites ?? [],
      ratings: profile?.ratings ?? []
    }
  });
}
