'use client';

import { FormEvent, useState } from 'react';

type Mode = 'login' | 'register' | 'verify' | 'forgot' | 'reset';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, displayName })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Η εγγραφή απέτυχε.');
        setMode('verify');
        setMessage(data.message);
        return;
      }

      if (mode === 'verify') {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Η επιβεβαίωση απέτυχε.');
        setMode('login');
        setMessage('Το email επιβεβαιώθηκε. Μπορείς να συνδεθείς.');
        return;
      }

      if (mode === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Η αποστολή επαναφοράς απέτυχε.');
        setMode('reset');
        setMessage(data.message);
        return;
      }

      if (mode === 'reset') {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, token, newPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Η αλλαγή κωδικού απέτυχε.');
        setMode('login');
        setMessage(data.message);
        return;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Η σύνδεση απέτυχε.');
      setMessage('Σύνδεση επιτυχής.');
      window.location.href = data.role === 'USER' ? '/' : '/admin';
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Κάτι πήγε στραβά.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page auth-page">
      <section className="auth-card">
        <h1>ANIVEX AUTH</h1>
        <p className="muted">Σύνδεση, εγγραφή, επιβεβαίωση email και επαναφορά κωδικού.</p>

        <div className="auth-switch">
          <button className={mode === 'login' ? 'button' : 'auth-tab'} onClick={() => setMode('login')}>Σύνδεση</button>
          <button className={mode === 'register' ? 'button' : 'auth-tab'} onClick={() => setMode('register')}>Εγγραφή</button>
          <button className={mode === 'verify' ? 'button' : 'auth-tab'} onClick={() => setMode('verify')}>Verify</button>
          <button className={mode === 'forgot' || mode === 'reset' ? 'button' : 'auth-tab'} onClick={() => setMode('forgot')}>Reset</button>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@example.com" />
          </label>

          {mode === 'register' && (
            <label>
              Όνομα προφίλ
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} type="text" minLength={2} placeholder="ANIVEX fan" />
            </label>
          )}

          {(mode === 'login' || mode === 'register') && (
            <label>
              Κωδικός
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={8} placeholder="********" />
            </label>
          )}

          {mode === 'verify' && (
            <label>
              Κωδικός επιβεβαίωσης
              <input value={code} onChange={(e) => setCode(e.target.value)} type="text" required minLength={6} maxLength={6} placeholder="123456" />
            </label>
          )}

          {mode === 'reset' && (
            <>
              <label>
                Reset token
                <input value={token} onChange={(e) => setToken(e.target.value)} type="text" required minLength={20} />
              </label>
              <label>
                Νέος κωδικός
                <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" required minLength={8} placeholder="********" />
              </label>
            </>
          )}

          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Παρακαλώ περίμενε...' : mode === 'login' ? 'Σύνδεση' : mode === 'register' ? 'Δημιουργία λογαριασμού' : mode === 'verify' ? 'Επιβεβαίωση email' : mode === 'forgot' ? 'Αποστολή reset link' : 'Αλλαγή κωδικού'}
          </button>
        </form>

        {message && <p className="auth-message" role="status">{message}</p>}
      </section>
    </main>
  );
}
