import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

const ForgotSchema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const parsed = ForgotSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const resetToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    await prisma.user.update({ where: { id: user.id }, data: { resetToken } });
    console.info(`ANIVEX password reset token for ${email}: ${resetToken}`);
  }

  return NextResponse.json({ ok: true, message: 'Αν υπάρχει λογαριασμός με αυτό το email, στάλθηκε link επαναφοράς.' });
}
