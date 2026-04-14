-- Cost Management System Database Schema

-- ServiceCost: Track actual costs from all services
CREATE TABLE IF NOT EXISTS "ServiceCost" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service VARCHAR(50) NOT NULL, -- 'stripe', 'supabase', 'google-cloud', 'mapbox', 'resend', 'vonage'
  month DATE NOT NULL,
  cost DECIMAL(12, 2) NOT NULL,
  usageMetric VARCHAR(255), -- e.g., "50M API calls", "100GB storage"
  notes TEXT,

  -- API metadata for tracking source of data
  apiSource VARCHAR(100), -- 'stripe_api', 'gcp_billing_api', 'supabase_api', etc.
  lastSyncedAt TIMESTAMP DEFAULT now(),

  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now(),

  -- Uniqueness constraint: one cost record per service per month
  UNIQUE(service, month)
);

-- BudgetAlert: Configure spending limits and alert thresholds
CREATE TABLE IF NOT EXISTS "BudgetAlert" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service VARCHAR(50) NOT NULL,
  monthlyLimit DECIMAL(12, 2) NOT NULL,
  alertEmail VARCHAR(255),
  alertThreshold INT DEFAULT 80, -- Alert at 80% of budget
  enabled BOOLEAN DEFAULT TRUE,

  -- Alert history
  lastAlertSentAt TIMESTAMP,
  lastAlertType VARCHAR(50), -- 'warning', 'critical'

  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now(),

  -- One budget alert per service
  UNIQUE(service)
);

-- CostTrend: Historical cost data for trend analysis
CREATE TABLE IF NOT EXISTS "CostTrend" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service VARCHAR(50) NOT NULL,
  month DATE NOT NULL,
  cost DECIMAL(12, 2) NOT NULL,
  previousMonthCost DECIMAL(12, 2),
  percentChange DECIMAL(5, 2), -- Percent change from previous month

  -- Forecasting data
  forecastedCost DECIMAL(12, 2),
  forecastConfidence VARCHAR(10), -- 'HIGH', 'MEDIUM', 'LOW'

  createdAt TIMESTAMP DEFAULT now(),

  UNIQUE(service, month)
);

-- CostAnomaly: Detected unusual cost patterns
CREATE TABLE IF NOT EXISTS "CostAnomaly" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service VARCHAR(50) NOT NULL,
  month DATE NOT NULL,
  actualCost DECIMAL(12, 2) NOT NULL,
  expectedCost DECIMAL(12, 2) NOT NULL,
  percentDeviation DECIMAL(5, 2), -- How much higher/lower than expected
  severity VARCHAR(20), -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'

  -- Context
  description TEXT,
  rootCauseAnalysis TEXT, -- What might have caused this?

  -- Notification status
  alertSentAt TIMESTAMP,
  acknowledged BOOLEAN DEFAULT FALSE,

  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now()
);

-- ServiceUsageMetrics: Track actual usage for cost per unit calculations
CREATE TABLE IF NOT EXISTS "ServiceUsageMetrics" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service VARCHAR(50) NOT NULL,
  month DATE NOT NULL,

  -- Stripe specific
  stripePaymentVolume DECIMAL(15, 2), -- Total payment volume
  stripeFailedTransactions INT,
  stripeChargebacks INT,
  stripeTransactionCount INT,

  -- Google Cloud specific
  gcpApiCallsCount BIGINT, -- Total API calls
  gcpDataTransferGB DECIMAL(12, 2), -- Data transfer in GB
  gcpComputeHours DECIMAL(12, 2), -- Compute hours used

  -- Supabase specific
  supabaseDatabaseQueries BIGINT,
  supabaseStorageGB DECIMAL(12, 2),
  supabaseRealtimeConnections INT,

  -- Mapbox specific
  mapboxRequestCount BIGINT,
  mapboxRoutingRequestCount INT,

  -- Vonage specific
  vonageSMSSent BIGINT,
  vonageMinutesUsed DECIMAL(12, 2),

  -- Resend specific
  resendEmailsSent BIGINT,
  resendBounceRate DECIMAL(5, 2),

  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now(),

  UNIQUE(service, month)
);

-- CostOptimization: Track optimization recommendations and actions
CREATE TABLE IF NOT EXISTS "CostOptimization" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service VARCHAR(50) NOT NULL,
  recommendationType VARCHAR(100), -- 'upgrade_plan', 'reduce_usage', 'enable_caching', etc.

  -- Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  estimatedSavings DECIMAL(12, 2), -- Potential monthly savings
  implementationEffort VARCHAR(20), -- 'LOW', 'MEDIUM', 'HIGH'

  -- Status
  status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'completed', 'dismissed'
  implementedAt TIMESTAMP,
  actualSavings DECIMAL(12, 2), -- Realized savings after implementation

  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_service_cost_month ON "ServiceCost"(service, month DESC);
CREATE INDEX IF NOT EXISTS idx_service_cost_created ON "ServiceCost"(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_cost_trend_service ON "CostTrend"(service, month DESC);
CREATE INDEX IF NOT EXISTS idx_cost_anomaly_severity ON "CostAnomaly"(severity, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_month ON "ServiceUsageMetrics"(month DESC);
CREATE INDEX IF NOT EXISTS idx_optimization_service ON "CostOptimization"(service, status);

-- Function to calculate cost per unit
CREATE OR REPLACE FUNCTION calculate_cost_per_unit(
  p_service VARCHAR,
  p_month DATE
) RETURNS TABLE (
  cost_per_unit DECIMAL,
  metric_name VARCHAR
) AS $$
BEGIN
  CASE p_service
    WHEN 'stripe' THEN
      RETURN QUERY
      SELECT
        (sc.cost / NULLIF(sum.stripeTransactionCount, 0))::DECIMAL,
        'cost_per_transaction'::VARCHAR
      FROM "ServiceCost" sc
      LEFT JOIN "ServiceUsageMetrics" sum ON sc.service = sum.service AND sc.month = sum.month
      WHERE sc.service = 'stripe' AND sc.month = p_month;

    WHEN 'google-cloud' THEN
      RETURN QUERY
      SELECT
        (sc.cost / NULLIF(sum.gcpApiCallsCount, 0))::DECIMAL,
        'cost_per_api_call'::VARCHAR
      FROM "ServiceCost" sc
      LEFT JOIN "ServiceUsageMetrics" sum ON sc.service = sum.service AND sc.month = sum.month
      WHERE sc.service = 'google-cloud' AND sc.month = p_month;
  END CASE;
END;
$$ LANGUAGE plpgsql;
