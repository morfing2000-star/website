import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword, verifyPassword } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

async function ensureOwnerUser() {
  const ownerEmail = 'owner@anivex.studio';
  const existing = await prisma.user.findUnique({ where: { email: ownerEmail } });
  if (existing) return;

  await prisma.user.create({
    data: {
      email: ownerEmail,
      passwordHash: await hashPassword('OwnerPass123!'),
      role: 'OWNER',
      emailVerified: new Date()
    }
  });
}

export async function POST(req: Request) {
  await ensureOwnerUser();

  const parsed = LoginSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  if (!user.emailVerified) return NextResponse.json({ error: 'Email not verified' }, { status: 403 });
  if (user.isBanned) return NextResponse.json({ error: 'User is banned' }, { status: 403 });

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt
    }
  });

  const response = NextResponse.json({ ok: true, role: user.role, userId: user.id });
  response.cookies.set('anivex_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}
