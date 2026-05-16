import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/session';
import { canManageContent } from '@/app/lib/roles';

export const dynamic = 'force-dynamic';

const EpisodeSchema = z.object({
  animeId: z.string().min(1),
  seasonNumber: z.number().int().min(1),
  seasonTitle: z.string().min(1),
  episodeNumber: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  hlsMasterUrl: z.string().url(),
  introEndSec: z.number().int().min(0).optional(),
  subtitles: z.array(z.string().url()).default([])
});

export async function POST(req: Request) {
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageContent(current.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = EpisodeSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const season = await prisma.season.upsert({
    where: { animeId_number: { animeId: parsed.data.animeId, number: parsed.data.seasonNumber } },
    update: { title: parsed.data.seasonTitle },
    create: { animeId: parsed.data.animeId, number: parsed.data.seasonNumber, title: parsed.data.seasonTitle }
  });

  const episode = await prisma.episode.upsert({
    where: { seasonId_number: { seasonId: season.id, number: parsed.data.episodeNumber } },
    update: {
      title: parsed.data.title,
      description: parsed.data.description,
      hlsMasterUrl: parsed.data.hlsMasterUrl,
      introEndSec: parsed.data.introEndSec,
      subtitles: parsed.data.subtitles
    },
    create: {
      seasonId: season.id,
      number: parsed.data.episodeNumber,
      title: parsed.data.title,
      description: parsed.data.description,
      hlsMasterUrl: parsed.data.hlsMasterUrl,
      introEndSec: parsed.data.introEndSec,
      subtitles: parsed.data.subtitles
    }
  });

  return NextResponse.json({ ok: true, season, episode }, { status: 201 });
}
