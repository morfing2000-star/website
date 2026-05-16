import Link from 'next/link';
import { AnimeCard } from './components/AnimeCard';
import { Splash } from './components/Splash';
import { prisma } from './lib/prisma';

export const dynamic = 'force-dynamic';

async function getHomeRows() {
  const anime = await prisma.anime.findMany({
    include: { ratings: true, seasons: { include: { episodes: { orderBy: { number: 'asc' } } }, orderBy: { number: 'asc' } } },
    orderBy: { createdAt: 'desc' },
    take: 24
  });

  const withRating = anime.map((item) => ({
    ...item,
    averageRating: item.ratings.length ? item.ratings.reduce((sum, rating) => sum + rating.value, 0) / item.ratings.length : null
  }));

  return {
    'Πρόσφατες προσθήκες': withRating,
    'Κορυφαίες βαθμολογίες': [...withRating].sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
  };
}

export default async function HomePage() {
  const rows = await getHomeRows();
  const hasContent = Object.values(rows).some((items) => items.length > 0);

  return (
    <main className="page">
      <Splash />
      <nav className="nav">
        <div className="brand">
          <img src="/anivex-logo.svg" alt="ANIVEX logo" />
          <span>ANIVEX STUDIO</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <small className="muted">EL</small>
          <Link href="/auth" className="muted">Σύνδεση</Link>
          <Link href="/admin" className="muted">Admin</Link>
        </div>
      </nav>

      <section className="hero">
        <h1>Η νέα εμπειρία streaming anime.</h1>
        <p>
          Πλήρης πλατφόρμα με λογαριασμούς, email verification, επαναφορά κωδικού, ρόλους,
          HLS player, αγαπημένα, βαθμολογίες, ιστορικό προβολής, σχόλια και admin εργαλεία.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href={hasContent ? '/api/anime' : '/admin'} className="button">
            {hasContent ? 'Δες τον κατάλογο' : 'Πρόσθεσε το πρώτο anime'}
          </Link>
          <Link className="button" href="/auth">Δημιουργία λογαριασμού</Link>
        </div>
      </section>

      {hasContent ? (
        Object.entries(rows).map(([title, items]) => (
          <section key={title} className="section">
            <h2>{title}</h2>
            <div className="row">
              {items.map((item) => {
                const episode = item.seasons[0]?.episodes[0];
                const href = episode ? `/watch/${item.id}/${episode.id}` : `/api/anime`;
                return (
                  <Link href={href} key={item.id}>
                    <AnimeCard title={item.title} meta={`${item.type} • ${item.averageRating ? item.averageRating.toFixed(1) : 'Νέα προσθήκη'}`} />
                  </Link>
                );
              })}
            </div>
          </section>
        ))
      ) : (
        <section className="section empty-state">
          <h2>Δεν υπάρχει ακόμη περιεχόμενο</h2>
          <p className="muted">Σύνδεσε τη βάση PostgreSQL, μπες ως διαχειριστής και πρόσθεσε anime από το admin panel.</p>
          <Link href="/admin" className="button">Άνοιγμα admin panel</Link>
        </section>
      )}
    </main>
  );
}
