import { FeatureButton } from './FeatureButton';

const featureGroups = [
  {
    title: 'Λειτουργίες χρήστη',
    items: [
      ['Προσθήκη στα αγαπημένα', 'Το Favorites UI είναι mock στο Phase 1. Το DB model υπάρχει και θα συνδεθεί στο Phase 2.'],
      ['Προσθήκη στη watchlist', 'Η watchlist θα συνδεθεί με profile persistence στο Phase 2.'],
      ['Βαθμολόγηση anime', 'Το ratings model υπάρχει, αλλά η ορατή φόρμα βαθμολογίας θα προστεθεί στο Phase 2.'],
      ['Διαγραφή ιστορικού', 'Το watch history model υπάρχει, αλλά delete endpoint και UI θα προστεθούν στο Phase 2.']
    ]
  },
  {
    title: 'Κοινότητα και moderation',
    items: [
      ['Άνοιγμα σχολίων', 'Υπάρχει basic comments API. Threaded UI και like/dislike/report panel θα μπουν στο Phase 2.'],
      ['Αναφορά σχολίου', 'Το report state υπάρχει στο schema/API shape, αλλά το moderation queue UI θα μπει στο Phase 2.'],
      ['Ban από σχόλια', 'Τα ban fields υπάρχουν στο User model. Το admin ban UI θα μπει στο Phase 1B.']
    ]
  },
  {
    title: 'Streaming και upload',
    items: [
      ['Upload anime', 'Υπάρχει owner-only upload endpoint. Πραγματικό file picker, queue worker και HLS jobs θα μπουν στο Phase 3.'],
      ['Bulk upload', 'Το bulk upload χρειάζεται background worker και storage. Θα προστεθεί στο Phase 3.'],
      ['Export logs', 'Υπάρχει demo logs endpoint. Το export .txt θα προστεθεί στο admin Phase 1B.']
    ]
  }
] as const;

export function FeatureShowcase() {
  return (
    <section className="section">
      <h2>Οδικός χάρτης λειτουργιών</h2>
      <p className="muted">
        Τα κουμπιά για λειτουργίες που δεν έχουν ολοκληρωθεί ακόμα εμφανίζουν καθαρό μήνυμα αντί να οδηγούν σε άδεια σελίδα ή να φαίνονται σπασμένα.
      </p>
      <div className="feature-grid">
        {featureGroups.map((group) => (
          <article className="card" key={group.title}>
            <div className="card-content">
              <h3>{group.title}</h3>
              <div className="feature-stack">
                {group.items.map(([label, message]) => (
                  <FeatureButton key={label} label={label} message={message} />
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
