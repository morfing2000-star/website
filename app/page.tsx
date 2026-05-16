import Link from 'next/link';
import { AnimeCard } from './components/AnimeCard';
import { Splash } from './components/Splash';
import { FeatureShowcase } from './components/FeatureShowcase';

const rows = {
  'Δημοφιλή': ['Solo Leveling', 'Attack on Titan', 'Demon Slayer', 'Jujutsu Kaisen'],
  'Πρόσφατες προσθήκες': ['Kaiju No.8', 'Wind Breaker', 'Bleach TYBW', 'One Piece'],
  'Συνέχεια παρακολούθησης': ['Chainsaw Man', 'Frieren', 'Mushoku Tensei', 'Blue Lock'],
  'Κορυφαίες βαθμολογίες': ['Steins;Gate', 'Death Note', 'Fullmetal Alchemist: Brotherhood', 'Monster']
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
          <Link href="/auth" className="muted">Σύνδεση</Link>
          <Link href="/admin" className="muted">Admin</Link>
        </div>
      </nav>

      <section className="hero">
        <h1>Η νέα εμπειρία streaming anime.</h1>
        <p>
          Σύνδεση και εγγραφή, verification code, επαναφορά κωδικού, Discord OAuth hooks, role-based panel,
          HLS player με skip intro/auto-next/resume και moderation system για σχόλια.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/watch/a1/e1" className="button">Έναρξη προβολής</Link>
          <a className="button" href="/api/search?q=solo">Live demo αναζήτησης</a>
        </div>
      </section>

      {Object.entries(rows).map(([title, items]) => (
        <section key={title} className="section">
          <h2>{title}</h2>
          <div className="row">
            {items.map((item) => (
              <AnimeCard key={item} title={item} meta="HD • Υπότιτλοι/Dub • 2026" />
            ))}
          </div>
        </section>
      ))}

      <FeatureShowcase />

      <section className="section">
        <h2>Loading placeholders / skeletons</h2>
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
