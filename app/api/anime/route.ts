import { NextResponse } from 'next/server';
import { listAnime } from '@/app/lib/data/store';

export async function GET() {
  const items = listAnime({});
  return NextResponse.json({
    homepage: {
      trending: items,
      recentlyAdded: items,
      continueWatching: items.slice(0, 2),
      topRated: [...items].sort((a, b) => b.rating - a.rating)
    },
    filters: ['Genre', 'Year', 'Status']
  });
}
