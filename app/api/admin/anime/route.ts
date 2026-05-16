import { NextResponse } from 'next/server';
import { AnimeType } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/session';
import { canManageContent } from '@/app/lib/roles';

export const dynamic = 'force-dynamic';

const AnimeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  genres: z.array(z.string().min(1)).default([]),
  tags: z.array(z.string().min(1)).default([]),
  coverImage: z.string().url(),
  bannerImage: z.string().url(),
  trailerVideo: z.string().url().nullable().optional(),
  type: z.nativeEnum(AnimeType).default('SERIES')
});

export async function GET() {
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageContent(current.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const anime = await prisma.anime.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  return NextResponse.json({ anime });
}

export async function POST(req: Request) {
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageContent(current.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = AnimeSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const anime = await prisma.anime.create({ data: parsed.data });
  return NextResponse.json({ ok: true, anime }, { status: 201 });
}
