import { AdminControls } from '../components/AdminControls';

export default function AdminPage() {
  return (
    <main className="page" style={{ padding: '1.5rem' }}>
      <h1>Πίνακας διαχείρισης</h1>
      <div className="row">
        <article className="card"><div className="card-content"><strong>Online χρήστες</strong><p className="muted">128</p></div></article>
        <article className="card"><div className="card-content"><strong>Συνολικά views</strong><p className="muted">84,221</p></div></article>
        <article className="card"><div className="card-content"><strong>Uploads σε αναμονή</strong><p className="muted">7</p></div></article>
        <article className="card"><div className="card-content"><strong>Αναφορές</strong><p className="muted">12</p></div></article>
      </div>
      <AdminControls />
    </main>
  );
}
