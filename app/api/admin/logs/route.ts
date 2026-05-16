import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/session';
import { canAccessAdmin } from '@/app/lib/roles';

export const dynamic = 'force-dynamic';

export async function GET() {
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canAccessAdmin(current.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [loginActivity, uploadActions, reportedComments] = await Promise.all([
    prisma.session.findMany({
      include: { user: { select: { email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    }),
    prisma.uploadJob.findMany({
      include: { anime: { select: { title: true } }, createdBy: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    }),
    prisma.comment.findMany({
      where: { isReported: true },
      include: { user: { select: { email: true } }, anime: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
  ]);

  return NextResponse.json({ loginActivity, uploadActions, reportedComments });
}
