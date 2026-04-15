'use client';

import { FormEvent, useState } from 'react';

type Mode = 'login' | 'register' | 'verify';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
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
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Register failed');
        setMode('verify');
        setMessage(`${data.message} Κωδικός demo: ${data.verificationCodePreview}`);
        return;
      }

      if (mode === 'verify') {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Verification failed');
        setMode('login');
        setMessage('Το email επιβεβαιώθηκε. Κάνε login.');
        return;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Login failed');
      setMessage('Login επιτυχές! Τώρα μπορείς να ανοίξεις το /admin.');
      window.location.href = '/admin';
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
        <p className="muted">Login / Register / Email Verification</p>

        <div className="auth-switch">
          <button className={mode === 'login' ? 'button' : 'auth-tab'} onClick={() => setMode('login')}>Login</button>
          <button className={mode === 'register' ? 'button' : 'auth-tab'} onClick={() => setMode('register')}>Register</button>
          <button className={mode === 'verify' ? 'button' : 'auth-tab'} onClick={() => setMode('verify')}>Verify</button>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@example.com" />
          </label>

          {mode !== 'verify' && (
            <label>
              Password
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={8} placeholder="********" />
            </label>
          )}

          {mode === 'verify' && (
            <label>
              Verification code
              <input value={code} onChange={(e) => setCode(e.target.value)} type="text" required minLength={6} maxLength={6} placeholder="123456" />
            </label>
          )}

          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Loading...' : mode === 'login' ? 'Login' : mode === 'register' ? 'Create account' : 'Verify email'}
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}
      </section>
    </main>
  );
}
