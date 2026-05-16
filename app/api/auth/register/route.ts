import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(40).optional()
});

export async function POST(req: Request) {
  const parsed = RegisterSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Το email χρησιμοποιείται ήδη.' }, { status: 409 });
  }

  const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(parsed.data.password),
      verificationCode,
      role: 'USER',
      profiles: {
        create: {
          displayName: parsed.data.displayName ?? email.split('@')[0]
        }
      },
      notifications: {
        create: {
          title: 'Καλώς ήρθες στο ANIVEX',
          message: 'Ο λογαριασμός σου δημιουργήθηκε επιτυχώς. Επιβεβαίωσε το email σου για να συνεχίσεις.'
        }
      }
    }
  });

  console.info(`ANIVEX verification code for ${email}: ${verificationCode}`);

  return NextResponse.json({
    ok: true,
    email: user.email,
    message: 'Η εγγραφή ολοκληρώθηκε. Έλεγξε το email σου για τον κωδικό επιβεβαίωσης.'
  }, { status: 201 });
}
