import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(req: Request) {
  const parsed = RegisterSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already used' }, { status: 409 });
  }

  const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      verificationCode,
      role: 'USER'
    }
  });

  return NextResponse.json({
    message: 'Εγγραφή επιτυχής. Έγινε αποστολή verification code στο email.',
    email: user.email,
    verificationCodePreview: verificationCode
  });
}
