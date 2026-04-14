export default function AdminPage() {
  return (
    <main className="page" style={{ padding: '1.5rem' }}>
      <h1>Admin Dashboard</h1>
      <div className="row">
        <article className="card"><div className="card-content"><strong>Online users</strong><p className="muted">128</p></div></article>
        <article className="card"><div className="card-content"><strong>Total views</strong><p className="muted">84,221</p></div></article>
        <article className="card"><div className="card-content"><strong>Pending uploads</strong><p className="muted">7</p></div></article>
        <article className="card"><div className="card-content"><strong>Reports</strong><p className="muted">12</p></div></article>
      </div>
    </main>
  );
}
