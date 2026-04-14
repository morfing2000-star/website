import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession, getUserById } from '@/app/lib/data/store';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('anivex_session')?.value;
  const session = getSession(token);
  const path = req.nextUrl.pathname;

  if (!session && (path.startsWith('/admin') || path.startsWith('/api/admin'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session) {
    const user = getUserById(session.userId);
    if (user?.isBanned) {
      return NextResponse.redirect(new URL('/?banned=1', req.url));
    }
    if ((path.startsWith('/admin') || path.startsWith('/api/admin')) && user?.role === 'USER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};
