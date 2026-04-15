import { NextResponse } from 'next/server';
import { convertToHLS } from '@/app/lib/hls';

export async function POST(request: Request) {
  const { role = 'USER', inputPath = '/tmp/input.mp4', outputPath = '/tmp/hls' } = await request.json();

  if (role !== 'OWNER') {
    return NextResponse.json({ error: 'Only Owner can upload content.' }, { status: 403 });
  }

  try {
    await convertToHLS(inputPath, outputPath);
    return NextResponse.json({ ok: true, outputPath, approval: 'PENDING_MODERATOR_APPROVAL' });
  } catch {
    return NextResponse.json({ error: 'HLS conversion failed' }, { status: 500 });
  }
}
