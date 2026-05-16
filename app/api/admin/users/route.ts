import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/session';
import { canAccessAdmin, canManageUser } from '@/app/lib/roles';

export const dynamic = 'force-dynamic';

const UpdateUserSchema = z.object({
  userId: z.string().min(1),
  role: z.nativeEnum(Role).optional(),
  isBanned: z.boolean().optional(),
  banExpiresAt: z.string().datetime().nullable().optional()
});

export async function GET() {
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canAccessAdmin(current.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, emailVerified: true, isBanned: true, banExpiresAt: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canAccessAdmin(current.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = UpdateUserSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (!canManageUser(current.role, target.role)) return NextResponse.json({ error: 'Role escalation not allowed' }, { status: 403 });
  if (parsed.data.role && !canManageUser(current.role, parsed.data.role)) return NextResponse.json({ error: 'Role escalation not allowed' }, { status: 403 });

  const user = await prisma.user.update({
    where: { id: target.id },
    data: {
      ...(parsed.data.role ? { role: parsed.data.role } : {}),
      ...(typeof parsed.data.isBanned === 'boolean' ? { isBanned: parsed.data.isBanned } : {}),
      ...(parsed.data.banExpiresAt !== undefined ? { banExpiresAt: parsed.data.banExpiresAt ? new Date(parsed.data.banExpiresAt) : null } : {})
    },
    select: { id: true, email: true, role: true, emailVerified: true, isBanned: true, banExpiresAt: true, createdAt: true }
  });

  return NextResponse.json({ ok: true, user });
}
