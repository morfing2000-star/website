# ANIVEX STUDIO

Production-ready full-stack βάση για anime streaming πλατφόρμα με Netflix-style UI/UX, RBAC, HLS playback και admin εργαλεία.

## Τι υλοποιήθηκε

- **Netflix-inspired UI**: dark red/black theme, animated splash intro, responsive layout, glowing buttons, skeleton loading.
- **Ελληνικό UX copy**: βασικά labels, μηνύματα και roadmap notices εμφανίζονται στα ελληνικά για καθαρότερο demo flow.
- **Authentication APIs (Prisma-backed)**:
  - register
  - login (DB session cookie)
  - verify email code
  - forgot/reset password
  - Discord OAuth placeholder endpoint
- **Roles & permissions**: Owner/Admin/Moderator/User με role hierarchy checks.
- **Anime + search/filter**: endpoint με genre/year/status/query φίλτρα και suggestions.
- **Upload flow**: owner-only upload route + FFmpeg HLS conversion helper χωρίς shell interpolation.
- **Custom player**: HLS playback, skip intro, auto next countdown, resume watching, demo controls για ποιότητα, ταχύτητα, υπότιτλους, fullscreen και mini player.
- **Comment moderation**: profanity filter hook.
- **Admin**: dashboard page + logs endpoint + roles endpoint + roadmap actions για μη ολοκληρωμένες λειτουργίες.
- **i18n**: message bundles για English και Greek.

## Βασικές διαδρομές

- `/` Home
- `/watch/[animeId]/[episodeId]` Player
- `/auth` Login/Register/Verify UI
- `/admin` Admin dashboard
- `/api/auth/*` Auth endpoints
- `/api/search` Search & filter
- `/api/upload` Upload + HLS conversion

## Local run

Το Prisma schema χρησιμοποιεί PostgreSQL arrays, άρα χρειάζεται PostgreSQL database URL και όχι SQLite file URL.

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```

Για γρήγορη είσοδο owner στο demo, το login endpoint δημιουργεί seed χρήστη:

- Email: `owner@anivex.studio`
- Password: `OwnerPass123!`

## Παραγωγικό deployment (next steps)

1. Run Prisma migration before first run (`prisma migrate dev`).
2. Redis caching για search/homepage rows/sessions.
3. Queue workers για transcoding jobs (SQS/BullMQ/Temporal).
4. S3 ή Supabase Storage + CDN (CloudFront/Cloudflare).
5. NextAuth Discord provider + optional guild membership checks.
6. Audit logs σε append-only storage + SIEM export.
7. Full observability (OpenTelemetry, metrics, traces, alarms).
