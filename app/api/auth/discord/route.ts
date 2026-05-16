import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.APP_URL;

  if (!clientId || !baseUrl) {
    return NextResponse.json({ error: 'Το Discord login δεν έχει ρυθμιστεί ακόμα στον server.' }, { status: 503 });
  }

  const redirectUri = `${baseUrl.replace(/\/$/, '')}/api/auth/callback/discord`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify email'
  });

  return NextResponse.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
}
