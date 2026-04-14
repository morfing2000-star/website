import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/lib/session';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({
    profile: {
      email: user.email,
      role: user.role,
      avatar: '/anivex-logo.svg',
      bio: 'Anime fan',
      watchHistory: [],
      favorites: []
    }
  });
}
