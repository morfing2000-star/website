import Link from 'next/link';
import { AnimeCard } from './components/AnimeCard';
import { Splash } from './components/Splash';

const rows = {
  Trending: ['Solo Leveling', 'Attack on Titan', 'Demon Slayer', 'Jujutsu Kaisen'],
  'Recently Added': ['Kaiju No.8', 'Wind Breaker', 'Bleach TYBW', 'One Piece'],
  'Continue Watching': ['Chainsaw Man', 'Frieren', 'Mushoku Tensei', 'Blue Lock'],
  'Top Rated': ['Steins;Gate', 'Death Note', 'Fullmetal Alchemist: Brotherhood', 'Monster']
};

export default function HomePage() {
  return (
    <main className="page">
      <Splash />
      <nav className="nav">
        <div className="brand">
          <img src="/anivex-logo.svg" alt="ANIVEX logo" />
          <span>ANIVEX STUDIO</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <small className="muted">EN | EL</small>
          <Link href="/admin" className="muted">Admin</Link>
        </div>
      </nav>

      <section className="hero">
        <h1>Η νέα εμπειρία streaming anime.</h1>
        <p>
          Login/Signup, verification code, reset password, Discord OAuth hooks, role-based panel,
          HLS player με skip intro/auto-next/resume και moderation system για σχόλια.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/watch/a1/e1" className="button">Start Watching</Link>
          <a className="button" href="/api/search?q=solo">Live Search Demo</a>
        </div>
      </section>

      {Object.entries(rows).map(([title, items]) => (
        <section key={title} className="section">
          <h2>{title}</h2>
          <div className="row">
            {items.map((item) => (
              <AnimeCard key={item} title={item} meta="HD • Sub/Dub • 2026" />
            ))}
          </div>
        </section>
      ))}

      <section className="section">
        <h2>Loading placeholders</h2>
        <div className="row">
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      </section>
    </main>
  );
}
