# ANIVEX STUDIO

Full-stack βάση για anime streaming πλατφόρμα με Netflix-style UI/UX, πραγματικά Prisma-backed δεδομένα, RBAC, HLS playback και admin εργαλεία.

## Τι υλοποιήθηκε

- **Netflix-inspired UI**: dark red/black theme, animated splash intro, responsive layout, glowing buttons, skeleton loading.
- **Ελληνικό UX copy**: βασικά labels και μηνύματα εμφανίζονται στα ελληνικά για καθαρότερο user flow.
- **Authentication APIs (Prisma-backed)**:
  - register με δημιουργία profile και αποθήκευση verification code στη βάση
  - login με DB session cookie
  - verify email code
  - forgot/reset password με reset token στη βάση και invalidation των sessions
  - Discord OAuth redirect όταν ρυθμιστούν τα Discord env vars
- **Roles & permissions**: Owner/Admin/Moderator/User με role hierarchy checks σε admin endpoints.
- **Anime + search/filter**: Prisma-backed κατάλογος με genre/type/query φίλτρα και suggestions.
- **Content management**: admin endpoints και UI για δημιουργία anime, seasons και episodes.
- **Upload flow**: authenticated admin/owner upload route + FFmpeg HLS conversion helper χωρίς shell interpolation.
- **Custom player**: HLS playback, skip intro, auto next countdown, resume watching, persisted watch history, πραγματικό HLS quality switching μέσω hls.js, υπότιτλοι, fullscreen και mini player.
- **User library**: endpoints για favorites, ratings και watch history.
- **Comment moderation**: authenticated comments με profanity filter και reported-comments visibility στα admin logs.
- **Admin**: dashboard page με live counts, user role/ban controls, anime/episode creation και export logs σε `.txt`.
- **i18n**: message bundles για English και Greek.

## Βασικές διαδρομές

- `/` Home
- `/watch/[animeId]/[episodeId]` Player
- `/auth` Login/Register/Verify/Reset UI
- `/admin` Admin dashboard
- `/api/auth/*` Auth endpoints
- `/api/search` Search & filter
- `/api/favorites` Favorites
- `/api/ratings` Ratings
- `/api/watch-history` Watch history
- `/api/upload` Upload + HLS conversion
- `/api/admin/*` Admin management

## Local run

Το Prisma schema χρησιμοποιεί PostgreSQL arrays, άρα χρειάζεται PostgreSQL database URL και όχι SQLite file URL.

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```

Μετά την πρώτη εγγραφή, κάνε promote τον αρχικό owner μέσα από τη βάση:

```sql
UPDATE "User" SET role = 'OWNER', "emailVerified" = NOW() WHERE email = 'you@example.com';
```

Για local email verification/reset χωρίς mail provider, οι κωδικοί γράφονται στο server log. Σε production σύνδεσε email provider και αντικατάστησε τα `console.info` σημεία με πραγματική αποστολή email.

## Παραγωγικό deployment

1. Run Prisma migration before first run (`prisma migrate deploy`).
2. Ρύθμισε PostgreSQL, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` και Discord credentials αν θα χρησιμοποιηθεί Discord login.
3. Σύνδεσε email provider για verification και password reset emails.
4. Queue workers για transcoding jobs (SQS/BullMQ/Temporal).
5. S3 ή Supabase Storage + CDN (CloudFront/Cloudflare).
6. Audit logs σε append-only storage + SIEM export.
7. Full observability (OpenTelemetry, metrics, traces, alarms).
