import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserByEmail, saveUser } from '@/app/lib/data/store';
import { hashPassword } from '@/app/lib/auth';

const ResetSchema = z.object({
  email: z.string().email(),
  token: z.string().min(20),
  newPassword: z.string().min(8)
});

export async function POST(req: Request) {
  const parsed = ResetSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = getUserByEmail(parsed.data.email);
  if (!user || user.resetToken !== parsed.data.token) {
    return NextResponse.json({ error: 'Invalid reset token' }, { status: 400 });
  }

  user.passwordHash = await hashPassword(parsed.data.newPassword);
  user.resetToken = null;
  saveUser(user);

  return NextResponse.json({ ok: true, message: 'Ο κωδικός άλλαξε επιτυχώς.' });
}
