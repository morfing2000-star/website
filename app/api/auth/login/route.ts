import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSession, getUserByEmail, seedOwner } from '@/app/lib/data/store';
import { hashPassword, verifyPassword } from '@/app/lib/auth';

const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

export async function POST(req: Request) {
  seedOwner(await hashPassword('OwnerPass123!'));
  const parsed = LoginSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = getUserByEmail(parsed.data.email);
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  if (!user.verified) return NextResponse.json({ error: 'Email not verified' }, { status: 403 });
  if (user.isBanned) return NextResponse.json({ error: 'User is banned' }, { status: 403 });

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const token = createSession(user.id);
  const response = NextResponse.json({ ok: true, role: user.role, userId: user.id });
  response.cookies.set('anivex_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}
