import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const anime = await prisma.anime.findMany({
    include: {
      seasons: { include: { episodes: { orderBy: { number: 'asc' } } }, orderBy: { number: 'asc' } },
      ratings: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const withRating = anime.map((item) => ({
    ...item,
    averageRating: item.ratings.length ? item.ratings.reduce((sum, rating) => sum + rating.value, 0) / item.ratings.length : null
  }));

  return NextResponse.json({
    homepage: {
      trending: withRating.slice(0, 12),
      recentlyAdded: withRating.slice(0, 12),
      continueWatching: [],
      topRated: [...withRating].sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0)).slice(0, 12)
    },
    filters: ['Genre', 'Year', 'Status']
  });
}
