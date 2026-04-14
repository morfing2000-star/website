import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserByEmail, saveUser } from '@/app/lib/data/store';

const VerifySchema = z.object({ email: z.string().email(), code: z.string().length(6) });

export async function POST(req: Request) {
  const parsed = VerifySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = getUserByEmail(parsed.data.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (user.verificationCode !== parsed.data.code) return NextResponse.json({ error: 'Invalid code' }, { status: 400 });

  user.verified = true;
  user.verificationCode = null;
  saveUser(user);
  return NextResponse.json({ ok: true, message: 'Το email επιβεβαιώθηκε.' });
}
