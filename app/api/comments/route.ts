import { NextResponse } from 'next/server';
import { containsProfanity } from '@/app/lib/profanity';

export async function POST(request: Request) {
  const body = await request.json();
  if (containsProfanity(body.text ?? '')) {
    return NextResponse.json({ error: 'Profanity detected' }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    comment: {
      id: crypto.randomUUID(),
      animeId: body.animeId,
      parentId: body.parentId ?? null,
      text: body.text,
      likes: 0,
      dislikes: 0,
      reported: false
    }
  });
}
