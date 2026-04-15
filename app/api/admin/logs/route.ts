import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    loginActivity: [{ ip: '127.0.0.1', success: true, at: new Date().toISOString() }],
    uploadActions: [],
    deletions: []
  });
}
