import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/app/lib/prisma';
import { hashPassword } from '@/app/lib/auth';

const ResetSchema = z.object({
  email: z.string().email(),
  token: z.string().min(20),
  newPassword: z.string().min(8)
});

export async function POST(req: Request) {
  const parsed = ResetSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || user.resetToken !== parsed.data.token) {
    return NextResponse.json({ error: 'Invalid reset token' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword), resetToken: null }
  });

  return NextResponse.json({ ok: true, message: 'Ο κωδικός άλλαξε επιτυχώς.' });
}
