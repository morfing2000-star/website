import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/session';
import { getPrimaryProfile } from '@/app/lib/profile';

export const dynamic = 'force-dynamic';

const FavoriteSchema = z.object({ animeId: z.string().min(1) });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = FavoriteSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const profile = await getPrimaryProfile(user.id);
  const favorite = await prisma.favorite.upsert({
    where: { profileId_animeId: { profileId: profile.id, animeId: parsed.data.animeId } },
    update: {},
    create: { profileId: profile.id, animeId: parsed.data.animeId },
    include: { anime: true }
  });

  return NextResponse.json({ ok: true, favorite });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const animeId = searchParams.get('animeId');
  if (!animeId) return NextResponse.json({ error: 'animeId is required' }, { status: 400 });

  const profile = await getPrimaryProfile(user.id);
  await prisma.favorite.deleteMany({ where: { profileId: profile.id, animeId } });
  return NextResponse.json({ ok: true });
}
