'use client';

import { FormEvent, useEffect, useState } from 'react';

type AdminUser = {
  id: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'USER';
  emailVerified: string | null;
  isBanned: boolean;
  createdAt: string;
};

type AdminAnime = {
  id: string;
  title: string;
  type: 'SERIES' | 'MOVIE';
  createdAt: string;
};

type AdminLogs = {
  loginActivity: Array<{ id: string; createdAt: string; ipAddress: string | null; user: { email: string; role: string } }>;
  uploadActions: Array<{ id: string; status: string; createdAt: string; anime: { title: string }; createdBy: { email: string } }>;
  reportedComments: Array<{ id: string; body: string; createdAt: string; anime: { title: string }; user: { email: string } }>;
};

export function AdminConsole() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [anime, setAnime] = useState<AdminAnime[]>([]);
  const [logs, setLogs] = useState<AdminLogs | null>(null);
  const [message, setMessage] = useState('');
  const [episodeForm, setEpisodeForm] = useState({ animeId: '', seasonNumber: '1', seasonTitle: 'Season 1', episodeNumber: '1', title: '', description: '', hlsMasterUrl: '', introEndSec: '85', subtitles: '' });
  const [form, setForm] = useState({
    title: '',
    description: '',
    genres: '',
    tags: '',
    coverImage: '',
    bannerImage: '',
    type: 'SERIES'
  });

  async function load() {
    const [usersRes, animeRes, logsRes] = await Promise.all([
      fetch('/api/admin/users'),
      fetch('/api/admin/anime'),
      fetch('/api/admin/logs')
    ]);

    if (usersRes.ok) setUsers((await usersRes.json()).users);
    if (animeRes.ok) setAnime((await animeRes.json()).anime);
    if (logsRes.ok) setLogs(await logsRes.json());
  }

  useEffect(() => {
    load().catch((error) => setMessage(error instanceof Error ? error.message : 'Δεν φορτώθηκαν τα admin δεδομένα.'));
  }, []);

  async function createAnime(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    const response = await fetch('/api/admin/anime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        type: form.type,
        genres: form.genres.split(',').map((value) => value.trim()).filter(Boolean),
        tags: form.tags.split(',').map((value) => value.trim()).filter(Boolean)
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ? JSON.stringify(data.error) : 'Η δημιουργία anime απέτυχε.');
      return;
    }
    setMessage('Το anime δημιουργήθηκε.');
    setForm({ title: '', description: '', genres: '', tags: '', coverImage: '', bannerImage: '', type: 'SERIES' });
    await load();
  }


  async function createEpisode(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    const response = await fetch('/api/admin/episodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        animeId: episodeForm.animeId,
        seasonNumber: Number(episodeForm.seasonNumber),
        seasonTitle: episodeForm.seasonTitle,
        episodeNumber: Number(episodeForm.episodeNumber),
        title: episodeForm.title,
        description: episodeForm.description,
        hlsMasterUrl: episodeForm.hlsMasterUrl,
        introEndSec: Number(episodeForm.introEndSec),
        subtitles: episodeForm.subtitles.split(',').map((value) => value.trim()).filter(Boolean)
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ? JSON.stringify(data.error) : 'Η αποθήκευση επεισοδίου απέτυχε.');
      return;
    }
    setMessage('Το επεισόδιο αποθηκεύτηκε.');
    setEpisodeForm({ animeId: '', seasonNumber: '1', seasonTitle: 'Season 1', episodeNumber: '1', title: '', description: '', hlsMasterUrl: '', introEndSec: '85', subtitles: '' });
    await load();
  }

  async function updateUser(userId: string, role: AdminUser['role'], isBanned: boolean) {
    const response = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role, isBanned })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ? JSON.stringify(data.error) : 'Η ενημέρωση χρήστη απέτυχε.');
      return;
    }
    setMessage('Ο χρήστης ενημερώθηκε.');
    await load();
  }

  function exportLogs() {
    if (!logs) return;
    const text = JSON.stringify(logs, null, 2);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `anivex-logs-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="section admin-controls">
      <div className="admin-grid">
        <article className="card">
          <div className="card-content">
            <h2>Προσθήκη anime</h2>
            <form className="auth-form" onSubmit={createAnime}>
              <label>Τίτλος<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
              <label>Περιγραφή<input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
              <label>Genres<input value={form.genres} onChange={(e) => setForm({ ...form, genres: e.target.value })} placeholder="Action, Fantasy" /></label>
              <label>Tags<input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Shonen, Magic" /></label>
              <label>Cover image URL<input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} type="url" required /></label>
              <label>Banner image URL<input value={form.bannerImage} onChange={(e) => setForm({ ...form, bannerImage: e.target.value })} type="url" required /></label>
              <label>Τύπος
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="SERIES">Series</option>
                  <option value="MOVIE">Movie</option>
                </select>
              </label>
              <button className="button" type="submit">Αποθήκευση anime</button>
            </form>
          </div>
        </article>


        <article className="card">
          <div className="card-content">
            <h2>Προσθήκη επεισοδίου</h2>
            <form className="auth-form" onSubmit={createEpisode}>
              <label>Anime
                <select value={episodeForm.animeId} onChange={(e) => setEpisodeForm({ ...episodeForm, animeId: e.target.value })} required>
                  <option value="">Επιλογή anime</option>
                  {anime.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                </select>
              </label>
              <label>Season number<input value={episodeForm.seasonNumber} onChange={(e) => setEpisodeForm({ ...episodeForm, seasonNumber: e.target.value })} type="number" min="1" required /></label>
              <label>Season title<input value={episodeForm.seasonTitle} onChange={(e) => setEpisodeForm({ ...episodeForm, seasonTitle: e.target.value })} required /></label>
              <label>Episode number<input value={episodeForm.episodeNumber} onChange={(e) => setEpisodeForm({ ...episodeForm, episodeNumber: e.target.value })} type="number" min="1" required /></label>
              <label>Episode title<input value={episodeForm.title} onChange={(e) => setEpisodeForm({ ...episodeForm, title: e.target.value })} required /></label>
              <label>HLS master URL<input value={episodeForm.hlsMasterUrl} onChange={(e) => setEpisodeForm({ ...episodeForm, hlsMasterUrl: e.target.value })} type="url" required /></label>
              <label>Intro end seconds<input value={episodeForm.introEndSec} onChange={(e) => setEpisodeForm({ ...episodeForm, introEndSec: e.target.value })} type="number" min="0" /></label>
              <label>Subtitle URLs<input value={episodeForm.subtitles} onChange={(e) => setEpisodeForm({ ...episodeForm, subtitles: e.target.value })} placeholder="https://.../el.vtt, https://.../en.vtt" /></label>
              <button className="button" type="submit">Αποθήκευση επεισοδίου</button>
            </form>
          </div>
        </article>

        <article className="card">
          <div className="card-content">
            <h2>Χρήστες</h2>
            <div className="table-list">
              {users.map((user) => (
                <div className="table-row" key={user.id}>
                  <div><strong>{user.email}</strong><p className="muted">{user.role} • {user.emailVerified ? 'verified' : 'unverified'}</p></div>
                  <select defaultValue={user.role} onChange={(e) => updateUser(user.id, e.target.value as AdminUser['role'], user.isBanned)}>
                    <option value="USER">USER</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="OWNER">OWNER</option>
                  </select>
                  <button className="auth-tab" type="button" onClick={() => updateUser(user.id, user.role, !user.isBanned)}>
                    {user.isBanned ? 'Unban' : 'Ban'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="card">
          <div className="card-content">
            <h2>Κατάλογος anime</h2>
            <div className="table-list">
              {anime.map((item) => <div className="table-row" key={item.id}><strong>{item.title}</strong><span className="muted">{item.type}</span></div>)}
            </div>
          </div>
        </article>

        <article className="card">
          <div className="card-content">
            <h2>Logs</h2>
            <p className="muted">Συνδέσεις: {logs?.loginActivity.length ?? 0} • Uploads: {logs?.uploadActions.length ?? 0} • Reports: {logs?.reportedComments.length ?? 0}</p>
            <button className="button" type="button" onClick={exportLogs}>Export logs .txt</button>
          </div>
        </article>
      </div>
      {message && <p className="auth-message" role="status">{message}</p>}
    </section>
  );
}
