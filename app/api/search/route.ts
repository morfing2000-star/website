import { NextResponse } from 'next/server';
import { AnimeType } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const genre = searchParams.get('genre')?.trim();
  const typeParam = searchParams.get('type') as AnimeType | null;

  const result = await prisma.anime.findMany({
    where: {
      ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] } : {}),
      ...(genre ? { genres: { has: genre } } : {}),
      ...(typeParam && Object.values(AnimeType).includes(typeParam) ? { type: typeParam } : {})
    },
    include: { ratings: true },
    orderBy: { createdAt: 'desc' },
    take: 25
  });

  return NextResponse.json({
    result: result.map((anime) => ({
      ...anime,
      averageRating: anime.ratings.length ? anime.ratings.reduce((sum, rating) => sum + rating.value, 0) / anime.ratings.length : null
    })),
    suggestions: result.slice(0, 5).map((a) => a.title)
  });
}
