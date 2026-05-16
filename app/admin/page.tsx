import { redirect } from 'next/navigation';
import { AdminConsole } from '../components/AdminConsole';
import { prisma } from '../lib/prisma';
import { getCurrentUser } from '../lib/session';
import { canAccessAdmin } from '../lib/roles';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const current = await getCurrentUser();
  if (!current || !canAccessAdmin(current.role)) redirect('/');

  const [onlineUsers, totalViews, pendingUploads, reports] = await Promise.all([
    prisma.session.count({ where: { expiresAt: { gt: new Date() } } }),
    prisma.watchHistory.count(),
    prisma.uploadJob.count({ where: { status: { in: ['PENDING', 'PROCESSING'] } } }),
    prisma.comment.count({ where: { isReported: true } })
  ]);

  return (
    <main className="page" style={{ padding: '1.5rem' }}>
      <h1>Πίνακας διαχείρισης</h1>
      <div className="row">
        <article className="card"><div className="card-content"><strong>Online χρήστες</strong><p className="muted">{onlineUsers}</p></div></article>
        <article className="card"><div className="card-content"><strong>Συνολικά views</strong><p className="muted">{totalViews}</p></div></article>
        <article className="card"><div className="card-content"><strong>Uploads σε αναμονή</strong><p className="muted">{pendingUploads}</p></div></article>
        <article className="card"><div className="card-content"><strong>Αναφορές</strong><p className="muted">{reports}</p></div></article>
      </div>
      <AdminConsole />
    </main>
  );
}
