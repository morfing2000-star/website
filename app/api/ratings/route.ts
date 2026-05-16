import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/session';
import { getPrimaryProfile } from '@/app/lib/profile';

export const dynamic = 'force-dynamic';

const RatingSchema = z.object({ animeId: z.string().min(1), value: z.number().int().min(1).max(10) });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = RatingSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const profile = await getPrimaryProfile(user.id);
  const rating = await prisma.rating.upsert({
    where: { profileId_animeId: { profileId: profile.id, animeId: parsed.data.animeId } },
    update: { value: parsed.data.value },
    create: { profileId: profile.id, animeId: parsed.data.animeId, value: parsed.data.value },
    include: { anime: true }
  });

  return NextResponse.json({ ok: true, rating });
}
