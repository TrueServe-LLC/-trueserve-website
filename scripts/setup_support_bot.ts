import { supabaseAdmin } from "../lib/supabase-admin";

async function setupSupportChat() {
    console.log("Setting up TrueServe AI Support infrastructure...");

    const createChatQuery = `
    CREATE TABLE IF NOT EXISTS "SupportChat" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT REFERENCES "User"("id") ON DELETE CASCADE,
        "userRole" TEXT NOT NULL, 
        "status" TEXT NOT NULL DEFAULT 'BOT_ACTIVE', 
        "language" TEXT DEFAULT 'en',
        "jiraTicketId" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
    `;

    const createMessageQuery = `
    CREATE TABLE IF NOT EXISTS "SupportMessage" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "chatId" UUID REFERENCES "SupportChat"("id") ON DELETE CASCADE NOT NULL,
        "sender" TEXT NOT NULL, 
        "content" TEXT NOT NULL,
        "translatedContent" TEXT, 
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    ALTER TABLE "SupportChat" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "SupportMessage" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Allow authenticated SupportChat" ON "SupportChat" FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Allow authenticated SupportMessage" ON "SupportMessage" FOR ALL USING (auth.role() = 'authenticated');
    `;

    console.log("------------------------------------------");
    console.log("Please run the following SQL in your Supabase SQL Editor if you haven't yet:");
    console.log(createChatQuery);
    console.log(createMessageQuery);
    console.log("------------------------------------------");
}

setupSupportChat().catch(console.error);
