-- Vendor invoice tracking for Admin > Cost Management.
-- Run this once in Supabase SQL editor before using the invoice ledger.

CREATE TABLE IF NOT EXISTS "VendorInvoice" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(80) NOT NULL,
  "providerDisplayName" VARCHAR(120) NOT NULL,
  "invoiceNumber" VARCHAR(120) NOT NULL,
  "invoiceDate" DATE NOT NULL,
  "periodStart" DATE,
  "periodEnd" DATE,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  status VARCHAR(40) NOT NULL DEFAULT 'unknown',
  category VARCHAR(80),
  description TEXT,
  "paymentUrl" TEXT,
  "invoicePdfUrl" TEXT,
  "externalId" VARCHAR(180),
  "apiSource" VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb,
  "lastSyncedAt" TIMESTAMP DEFAULT now(),
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now(),

  UNIQUE(provider, "invoiceNumber")
);

CREATE INDEX IF NOT EXISTS idx_vendor_invoice_provider ON "VendorInvoice"(provider, "invoiceDate" DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_invoice_status ON "VendorInvoice"(status, "invoiceDate" DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_invoice_date ON "VendorInvoice"("invoiceDate" DESC);
