# Supabase

Supabase is our central backend provider, handling data persistence and security.

## Core Services
- **Postgres Database**: Standard SQL storage.
- **Auth**: Manually handled via OTP (Driver SMS) and Password.
- **Storage**: Used for driver document uploads.
- **Realtime**: Used for order tracking.

## Security (RLS)
Security is enforced at the database level via **Row Level Security**.
- Even if the frontend is compromised, the DB only allows users to see their own data.
- Verified via [[Security Testing]].

## Local Development
We use the Supabase CLI (optionally) or connect directly to a development project.
- Keys are stored in `.env.local`.
- Mock keys are used in [[E2E Testing (Playwright)|tests]].

---
#tags/supabase #database #security
