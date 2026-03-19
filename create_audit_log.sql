
-- Audit Log Table for tracking critical admin/system actions
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "actorId" UUID REFERENCES "User"(id),
    "action" TEXT NOT NULL, -- e.g. 'APPROVE_MENU_ITEM', 'FORCE_COMPLETE_ORDER'
    "targetId" TEXT, -- ID of the object being acted upon
    "entityType" TEXT, -- 'MenuItem', 'Order', 'Driver', etc.
    "before" JSONB, -- State before change
    "after" JSONB, -- State after change
    "message" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Read-only for Admins)
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON "AuditLog" FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN')
);
