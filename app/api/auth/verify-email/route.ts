import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

const VerifySchema = z.object({ email: z.string().email(), code: z.string().length(6) });

export async function POST(req: Request) {
  const parsed = VerifySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: 'Ο χρήστης δεν βρέθηκε.' }, { status: 404 });
  if (user.emailVerified) return NextResponse.json({ ok: true, message: 'Το email είναι ήδη επιβεβαιωμένο.' });
  if (user.verificationCode !== parsed.data.code) return NextResponse.json({ error: 'Λάθος κωδικός επιβεβαίωσης.' }, { status: 400 });

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date(), verificationCode: null }
  });

  return NextResponse.json({ ok: true, message: 'Το email επιβεβαιώθηκε.' });
}
