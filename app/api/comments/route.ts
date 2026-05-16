import { NextResponse } from 'next/server';
import { z } from 'zod';
import { containsProfanity } from '@/app/lib/profanity';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/session';

export const dynamic = 'force-dynamic';

const CommentSchema = z.object({
  animeId: z.string().min(1),
  parentId: z.string().min(1).nullable().optional(),
  text: z.string().min(1).max(2000)
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const animeId = searchParams.get('animeId');
  if (!animeId) return NextResponse.json({ error: 'animeId is required' }, { status: 400 });

  const comments = await prisma.comment.findMany({
    where: { animeId },
    include: { user: { select: { id: true, email: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ comments });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = CommentSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  if (containsProfanity(parsed.data.text)) {
    return NextResponse.json({ error: 'Το σχόλιο περιέχει απαγορευμένες λέξεις.' }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      animeId: parsed.data.animeId,
      parentId: parsed.data.parentId ?? null,
      userId: user.id,
      body: parsed.data.text
    },
    include: { user: { select: { id: true, email: true, avatarUrl: true } } }
  });

  return NextResponse.json({ ok: true, comment }, { status: 201 });
}
