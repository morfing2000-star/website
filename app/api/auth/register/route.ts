import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword } from '@/app/lib/auth';
import { getUserByEmail, saveUser, DemoUser, newToken } from '@/app/lib/data/store';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(req: Request) {
  const parsed = RegisterSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (getUserByEmail(parsed.data.email)) {
    return NextResponse.json({ error: 'Email already used' }, { status: 409 });
  }

  const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
  const user: DemoUser = {
    id: newToken(),
    email: parsed.data.email,
    passwordHash: await hashPassword(parsed.data.password),
    role: 'USER',
    isBanned: false,
    banExpiresAt: null,
    verificationCode,
    resetToken: null,
    verified: false
  };

  saveUser(user);

  return NextResponse.json({
    message: 'Εγγραφή επιτυχής. Έγινε αποστολή verification code στο email.',
    email: user.email,
    verificationCodePreview: verificationCode
  });
}
