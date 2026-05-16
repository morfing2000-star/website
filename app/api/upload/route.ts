import { NextResponse } from 'next/server';
import { z } from 'zod';
import { convertToHLS } from '@/app/lib/hls';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/session';
import { canManageContent } from '@/app/lib/roles';

export const dynamic = 'force-dynamic';

const UploadSchema = z.object({
  animeId: z.string().min(1),
  inputPath: z.string().min(1),
  outputPath: z.string().min(1)
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageContent(user.role)) return NextResponse.json({ error: 'Δεν έχεις δικαίωμα upload.' }, { status: 403 });

  const parsed = UploadSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const job = await prisma.uploadJob.create({
    data: {
      animeId: parsed.data.animeId,
      createdById: user.id,
      inputPath: parsed.data.inputPath,
      outputPath: parsed.data.outputPath,
      status: 'PROCESSING'
    }
  });

  try {
    await convertToHLS(parsed.data.inputPath, parsed.data.outputPath);
    const updated = await prisma.uploadJob.update({
      where: { id: job.id },
      data: { status: 'APPROVED', logs: 'HLS conversion completed successfully.' }
    });
    return NextResponse.json({ ok: true, upload: updated });
  } catch (error) {
    await prisma.uploadJob.update({
      where: { id: job.id },
      data: { status: 'FAILED', logs: error instanceof Error ? error.message : 'HLS conversion failed' }
    });
    return NextResponse.json({ error: 'HLS conversion failed' }, { status: 500 });
  }
}
