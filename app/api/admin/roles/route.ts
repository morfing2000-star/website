import { NextResponse } from 'next/server';
import { z } from 'zod';
import { canManageRole } from '@/app/lib/auth';

const RoleSchema = z.object({ currentRole: z.enum(['OWNER', 'ADMIN', 'MODERATOR']), targetRole: z.enum(['ADMIN', 'MODERATOR', 'USER']) });

export async function POST(req: Request) {
  const parsed = RoleSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  if (!canManageRole(parsed.data.currentRole, parsed.data.targetRole)) {
    return NextResponse.json({ error: 'Role escalation not allowed' }, { status: 403 });
  }

  return NextResponse.json({ ok: true, message: 'Role updated' });
}
