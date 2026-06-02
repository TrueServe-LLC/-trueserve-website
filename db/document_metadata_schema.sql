-- TrueServe document metadata foundation.
-- Actual files belong in Supabase Storage. These tables store only review metadata,
-- signed-object paths, status, expiration dates, and reviewer notes.
--
-- Supabase SQL editor note:
-- Run this entire file from the first line. Do not highlight/run only the column
-- list that starts with "id uuid..." because those lines only work inside the
-- CREATE TABLE statement.

create extension if not exists "pgcrypto";

insert into storage.buckets (id, name, public)
values
  ('driver-documents', 'driver-documents', false),
  ('merchant-documents', 'merchant-documents', false)
on conflict (id) do update
set public = excluded.public;

create or replace function public.set_document_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$;

create table if not exists public."DriverDocument" (
  id uuid primary key default gen_random_uuid(),
  "driverId" text not null references public."Driver"(id) on delete cascade,
  "userId" text references public."User"(id) on delete set null,
  "docType" text not null check ("docType" in (
    'drivers_license',
    'insurance',
    'registration',
    'background_check',
    'other'
  )),
  "storageBucket" text not null default 'driver-documents',
  "storagePath" text not null,
  "originalFileName" text,
  "mimeType" text,
  "fileSize" integer,
  "uploadedAt" timestamptz not null default now(),
  "expiresAt" timestamptz,
  status text not null default 'pending' check (status in (
    'pending',
    'verified',
    'rejected',
    'expired'
  )),
  "reviewedBy" text references public."User"(id) on delete set null,
  "reviewedAt" timestamptz,
  notes text,
  "scanResult" jsonb not null default '{}'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint "DriverDocument_driver_doc_unique" unique ("driverId", "docType")
);

create table if not exists public."MerchantDocument" (
  id uuid primary key default gen_random_uuid(),
  "restaurantId" text not null references public."Restaurant"(id) on delete cascade,
  "docType" text not null check ("docType" in (
    'business_license',
    'health_permit',
    'liability_insurance',
    'menu',
    'pos_authorization',
    'tax_document',
    'other'
  )),
  "storageBucket" text not null default 'merchant-documents',
  "storagePath" text not null,
  "originalFileName" text,
  "mimeType" text,
  "fileSize" integer,
  "uploadedAt" timestamptz not null default now(),
  "expiresAt" timestamptz,
  status text not null default 'pending' check (status in (
    'pending',
    'verified',
    'rejected',
    'expired'
  )),
  "reviewedBy" text references public."User"(id) on delete set null,
  "reviewedAt" timestamptz,
  notes text,
  "scanResult" jsonb not null default '{}'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint "MerchantDocument_restaurant_doc_unique" unique ("restaurantId", "docType")
);

drop trigger if exists "DriverDocument_set_updatedAt" on public."DriverDocument";
create trigger "DriverDocument_set_updatedAt"
before update on public."DriverDocument"
for each row execute function public.set_document_updated_at();

drop trigger if exists "MerchantDocument_set_updatedAt" on public."MerchantDocument";
create trigger "MerchantDocument_set_updatedAt"
before update on public."MerchantDocument"
for each row execute function public.set_document_updated_at();

create index if not exists "DriverDocument_status_idx"
on public."DriverDocument" (status, "uploadedAt" desc);

create index if not exists "DriverDocument_driver_idx"
on public."DriverDocument" ("driverId");

create index if not exists "DriverDocument_expiry_idx"
on public."DriverDocument" ("expiresAt")
where "expiresAt" is not null;

create index if not exists "MerchantDocument_status_idx"
on public."MerchantDocument" (status, "uploadedAt" desc);

create index if not exists "MerchantDocument_restaurant_idx"
on public."MerchantDocument" ("restaurantId");

create index if not exists "MerchantDocument_expiry_idx"
on public."MerchantDocument" ("expiresAt")
where "expiresAt" is not null;

create or replace view public."DriverDocumentReviewQueue" as
select
  doc.id,
  doc."driverId",
  doc."userId",
  doc."docType",
  doc."storageBucket",
  doc."storagePath",
  doc."originalFileName",
  doc."uploadedAt",
  doc."expiresAt",
  doc.status,
  doc.notes,
  driver."complianceStatus",
  driver."vehicleType",
  "user".name as "driverName",
  "user".email as "driverEmail",
  "user".phone as "driverPhone"
from public."DriverDocument" doc
join public."Driver" driver on driver.id = doc."driverId"
left join public."User" "user" on "user".id = doc."userId"
where doc.status in ('pending', 'rejected', 'expired')
   or (doc."expiresAt" is not null and doc."expiresAt" <= now() + interval '30 days')
order by doc."uploadedAt" asc;

create or replace view public."MerchantDocumentReviewQueue" as
select
  doc.id,
  doc."restaurantId",
  doc."docType",
  doc."storageBucket",
  doc."storagePath",
  doc."originalFileName",
  doc."uploadedAt",
  doc."expiresAt",
  doc.status,
  doc.notes,
  restaurant.name as "restaurantName",
  restaurant.phone as "restaurantPhone",
  restaurant."ownerId"
from public."MerchantDocument" doc
join public."Restaurant" restaurant on restaurant.id = doc."restaurantId"
where doc.status in ('pending', 'rejected', 'expired')
   or (doc."expiresAt" is not null and doc."expiresAt" <= now() + interval '30 days')
order by doc."uploadedAt" asc;

comment on table public."DriverDocument" is
'Driver compliance document metadata. Files live in private Supabase Storage under driver-documents.';

comment on table public."MerchantDocument" is
'Merchant compliance document metadata. Files live in private Supabase Storage under merchant-documents.';
