import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyPassword } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

export async function POST(req: Request) {
  const parsed = LoginSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'Λάθος email ή κωδικός.' }, { status: 401 });
  if (!user.emailVerified) return NextResponse.json({ error: 'Το email δεν έχει επιβεβαιωθεί.' }, { status: 403 });
  if (user.isBanned) return NextResponse.json({ error: 'Ο λογαριασμός είναι αποκλεισμένος.' }, { status: 403 });

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: 'Λάθος email ή κωδικός.' }, { status: 401 });

  const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      userAgent: req.headers.get('user-agent')
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
