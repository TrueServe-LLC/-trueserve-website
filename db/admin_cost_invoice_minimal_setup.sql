-- Admin Cost Management + Vendor Invoice minimal setup
-- Run this whole file in the Supabase SQL editor for the same project used by production.
-- After it succeeds, click "Sync invoices" in Admin > Cost Management.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public."ServiceCost" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service VARCHAR(50) NOT NULL,
  month DATE NOT NULL,
  cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
  "usageMetric" VARCHAR(255),
  notes TEXT,
  "apiSource" VARCHAR(100),
  "lastSyncedAt" TIMESTAMPTZ DEFAULT now(),
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now(),
  UNIQUE(service, month)
);

CREATE TABLE IF NOT EXISTS public."VendorInvoice" (
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
  "lastSyncedAt" TIMESTAMPTZ DEFAULT now(),
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now(),
  UNIQUE(provider, "invoiceNumber")
);

CREATE TABLE IF NOT EXISTS public."BudgetAlert" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service VARCHAR(50) NOT NULL,
  "monthlyLimit" DECIMAL(12, 2) NOT NULL,
  "alertEmail" VARCHAR(255),
  "alertThreshold" INTEGER DEFAULT 80,
  enabled BOOLEAN DEFAULT true,
  "lastAlertSentAt" TIMESTAMPTZ,
  "lastAlertType" VARCHAR(50),
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now(),
  UNIQUE(service)
);

CREATE INDEX IF NOT EXISTS idx_service_cost_month ON public."ServiceCost"(service, month DESC);
CREATE INDEX IF NOT EXISTS idx_service_cost_created ON public."ServiceCost"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_invoice_provider ON public."VendorInvoice"(provider, "invoiceDate" DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_invoice_status ON public."VendorInvoice"(status, "invoiceDate" DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_invoice_date ON public."VendorInvoice"("invoiceDate" DESC);
CREATE INDEX IF NOT EXISTS idx_budget_alert_service ON public."BudgetAlert"(service);

NOTIFY pgrst, 'reload schema';

SELECT
  to_regclass('public."ServiceCost"') AS service_cost_table,
  to_regclass('public."VendorInvoice"') AS vendor_invoice_table,
  to_regclass('public."BudgetAlert"') AS budget_alert_table;
