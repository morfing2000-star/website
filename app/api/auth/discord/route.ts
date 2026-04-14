import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    enabled: false,
    message:
      'Discord OAuth placeholder. Configure NEXTAUTH_SECRET, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET and optional guild checks.'
  });
}
