import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserByEmail, newToken, saveUser } from '@/app/lib/data/store';

const ForgotSchema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const parsed = ForgotSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = getUserByEmail(parsed.data.email);
  if (!user) return NextResponse.json({ ok: true });

  user.resetToken = newToken();
  saveUser(user);

  return NextResponse.json({ ok: true, resetTokenPreview: user.resetToken, message: 'Στάλθηκε link επαναφοράς.' });
}
