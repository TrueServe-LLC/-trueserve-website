-- =============================================================================
-- TrueServe QA Seed Data
-- Run once in Supabase SQL Editor before your first QA test session.
-- Safe to re-run — all statements are idempotent (ON CONFLICT DO UPDATE).
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 1: Create QA test merchant auth user
-- Email    : testmerchant@trueserve.com
-- Password : TestMerchant123!
-- Auth UUID: aa000000-0000-0000-0000-000000000002
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  role,
  aud,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin
)
VALUES (
  'aa000000-0000-0000-0000-000000000002',
  'testmerchant@trueserve.com',
  crypt('TestMerchant123!', gen_salt('bf', 10)),
  now(),
  'authenticated',
  'authenticated',
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Test Merchant QA"}',
  false
)
ON CONFLICT (id) DO UPDATE SET
  email             = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  updated_at        = now();

-- Auth identity record (required for email/password login)
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  created_at,
  updated_at,
  provider_id
)
VALUES (
  'aa000000-0000-0000-0000-000000000002',
  'aa000000-0000-0000-0000-000000000002',
  '{"sub":"aa000000-0000-0000-0000-000000000002","email":"testmerchant@trueserve.com"}',
  'email',
  now(),
  now(),
  'testmerchant@trueserve.com'
)
ON CONFLICT (provider, provider_id) DO UPDATE SET
  identity_data = EXCLUDED.identity_data,
  updated_at    = now();

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 2: Create QA User profile row (Prisma User table)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt")
VALUES (
  'aa000000-0000-0000-0000-000000000002',
  'testmerchant@trueserve.com',
  'Test Merchant QA',
  'MERCHANT',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  email     = EXCLUDED.email,
  name      = EXCLUDED.name,
  role      = EXCLUDED.role,
  "updatedAt" = now();

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 3: Create QA restaurant — manualPrepTime starts as NULL (AI mode active)
-- Restaurant ID: aa000000-0000-0000-0000-000000000001
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO "Restaurant" (
  id,
  name,
  address,
  description,
  lat,
  lng,
  "openTime",
  "closeTime",
  "visibility",
  "isMock",
  city,
  state,
  "ownerId",
  "manualPrepTime",
  "isBusy",
  "createdAt",
  "updatedAt"
)
VALUES (
  'aa000000-0000-0000-0000-000000000001',
  'Test Kitchen QA',
  '100 QA Test Blvd, Charlotte, NC 28202',
  'QA test restaurant — do not display to customers.',
  35.2271,
  -80.8431,
  '08:00:00',
  '23:00:00',
  'HIDDEN',
  true,
  'Charlotte',
  'NC',
  'aa000000-0000-0000-0000-000000000002',
  NULL,
  false,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  name            = EXCLUDED.name,
  "ownerId"       = EXCLUDED."ownerId",
  "manualPrepTime" = NULL,
  "visibility"    = 'HIDDEN',
  "isMock"        = true,
  "updatedAt"     = now();

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICATION — run this after the seed to confirm state
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  r.id,
  r.name,
  r."manualPrepTime",
  r."avgPrepTime",
  r."ownerId",
  u.email AS owner_email
FROM "Restaurant" r
LEFT JOIN "User" u ON u.id = r."ownerId"
WHERE r.id = 'aa000000-0000-0000-0000-000000000001';
