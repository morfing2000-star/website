import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/session';
import { getPrimaryProfile } from '@/app/lib/profile';

export const dynamic = 'force-dynamic';

const WatchHistorySchema = z.object({
  animeId: z.string().min(1),
  episodeId: z.string().min(1),
  positionSec: z.number().int().min(0)
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = WatchHistorySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const profile = await getPrimaryProfile(user.id);
  const history = await prisma.watchHistory.upsert({
    where: {
      profileId_animeId_episodeId: {
        profileId: profile.id,
        animeId: parsed.data.animeId,
        episodeId: parsed.data.episodeId
      }
    },
    update: { positionSec: parsed.data.positionSec },
    create: { profileId: profile.id, animeId: parsed.data.animeId, episodeId: parsed.data.episodeId, positionSec: parsed.data.positionSec },
    include: { anime: true, episode: true }
  });

  return NextResponse.json({ ok: true, history });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const profile = await getPrimaryProfile(user.id);
  await prisma.watchHistory.deleteMany({ where: { profileId: profile.id } });
  return NextResponse.json({ ok: true });
}
