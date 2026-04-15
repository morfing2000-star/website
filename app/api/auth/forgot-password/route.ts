import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/app/lib/prisma';

const ForgotSchema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const parsed = ForgotSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return NextResponse.json({ ok: true });

  const resetToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  await prisma.user.update({ where: { id: user.id }, data: { resetToken } });

  return NextResponse.json({ ok: true, resetTokenPreview: resetToken, message: 'Στάλθηκε link επαναφοράς.' });
}
