'use client';

import { FeatureButton } from './FeatureButton';

export function AdminControls() {
  return (
    <section className="section admin-controls">
      <h2>Ενέργειες διαχείρισης</h2>
      <div className="feature-grid">
        <FeatureButton label="Διαχείριση χρηστών" message="Η λίστα χρηστών μαζί με role/ban controls είναι το επόμενο Phase 1B." />
        <FeatureButton label="Διαχείριση anime" message="Το Anime CRUD θα συνδεθεί με τα Prisma Anime/Season/Episode models στο Phase 2." />
        <FeatureButton label="Έγκριση uploads" message="Το approval queue υπάρχει ως schema concept. UI και worker queue θα μπουν στο Phase 3." />
        <FeatureButton label="Export logs .txt" message="Υπάρχει demo logs endpoint. Το export .txt θα προστεθεί στο admin panel." />
      </div>
    </section>
  );
}
