import { NextResponse } from 'next/server';
import { listAnime } from '@/app/lib/data/store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? undefined;
  const genre = searchParams.get('genre') ?? undefined;
  const year = searchParams.get('year') ? Number(searchParams.get('year')) : undefined;
  const status = (searchParams.get('status') as 'ONGOING' | 'COMPLETED' | null) ?? undefined;

  const result = listAnime({ query: q, genre, year, status });
  return NextResponse.json({
    result,
    suggestions: result.slice(0, 5).map((a) => a.title)
  });
}
