
-- Create Notification table
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT DEFAULT 'ORDER_UPDATE',
    "orderId" UUID REFERENCES "Order"("id") ON DELETE SET NULL,
    "isRead" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications" ON "Notification"
    FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can update their own notifications" ON "Notification"
    FOR UPDATE USING (auth.uid()::text = "userId");

-- Index for performance
CREATE INDEX IF NOT EXISTS "idx_notification_user_id" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "idx_notification_unread" ON "Notification"("userId") WHERE "isRead" = FALSE;
