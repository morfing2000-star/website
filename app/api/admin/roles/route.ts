import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/session';
import { canManageRole } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

const RoleSchema = z.object({ userId: z.string().min(1), targetRole: z.nativeEnum(Role) });

export async function POST(req: Request) {
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = RoleSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!canManageRole(current.role, target.role) || !canManageRole(current.role, parsed.data.targetRole)) {
    return NextResponse.json({ error: 'Role escalation not allowed' }, { status: 403 });
  }

  const user = await prisma.user.update({
    where: { id: target.id },
    data: { role: parsed.data.targetRole },
    select: { id: true, email: true, role: true }
  });

  return NextResponse.json({ ok: true, user });
}
