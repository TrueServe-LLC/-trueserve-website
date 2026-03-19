-- Retention Policy for Audit Logs
-- Retention: 1 Year (365 days)

CREATE OR REPLACE FUNCTION delete_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM "AuditLog"
    WHERE "createdAt" < NOW() - INTERVAL '365 days';
END;
$$;

-- In Supabase, you can schedule this using pg_cron if enabled:
-- SELECT cron.schedule('0 0 * * *', 'SELECT delete_old_audit_logs()');

-- For manual cleanup or as part of a maintenance script:
-- SELECT delete_old_audit_logs();
