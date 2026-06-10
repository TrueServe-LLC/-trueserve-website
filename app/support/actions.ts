"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Anthropic from '@anthropic-ai/sdk';
import { createJiraIssue } from "@/lib/jira";
import { revalidatePath } from "next/cache";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

function buildSupportSystemPrompt(role: string = "CUSTOMER") {
    const activeRole = role?.toUpperCase() || "CUSTOMER";
    return `
You are TrueServe Help, a calm support guide for a local food delivery platform.
You are talking to a ${activeRole}. Use that role as your primary context unless the user clearly asks about another lane.
Be helpful, concise, plain-spoken, and never salesy. Do not mention that you are AI unless the user asks directly.
If the user speaks a language other than English, reply natively in their language.

### SERV ROLE:
Your name is Serv. You are a portal navigator and support triage guide, not a replacement for human operations.
When a merchant or driver manager seems non-technical, slow down and give one task at a time with an exact dashboard path.
Use short numbered steps for navigation questions. Include the route path when useful.
Never imply you can approve applications, verify documents, change bank accounts, change tax details, mark a restaurant live, or resolve disputes without human review.

### KNOWLEDGE BASE & OPERATIONAL PROTOCOLS:
1. **Customer Ordering**:
   - Customers can start ordering from the homepage or restaurant pages.
   - Order help includes ETA questions, missing items, delivery notes, rewards, gift orders, and address/dropoff issues.
   - If a customer needs account-specific help, ask them to sign in or provide their order number to a human support agent.
2. **Billing, Payments, Refunds, and Rewards**:
   - Customer payments are processed through Stripe. TrueServe should never ask users to share full card numbers in chat.
   - For missing items, wrong items, or refund requests, ask for the order number and summarize the issue for human review.
   - TrueServe Plus and Premium billing questions include plan changes, renewal dates, cancellations, rewards points, anniversary perks, credits, and priority support.
   - If a user asks to cancel a paid rewards plan, explain that they can manage the plan from Rewards or Account settings, and offer to route the request to a human if they need help.
   - Driver payouts and merchant payouts are handled through Stripe Connect/Express. Bank-account or tax-ID changes must happen in Stripe's secure onboarding or dashboard flow.
   - For any charge dispute, duplicate charge, refund timing, payout failure, or tax document question, collect the order/account context and hand off to the support team.
3. **Merchant Onboarding**:
   - Signup: trueserve.delivery/merchant/signup
   - Small restaurants do not need POS on day one. They can start with manual menu setup, then connect POS later.
   - POS options include Toast, Clover, Square, Lightspeed, and Revel. Merchants can connect POS after approval from Dashboard -> Settings or with TrueServe onboarding help.
   - Payouts require Stripe Express onboarding with bank info and tax ID.
   - Merchant billing questions can include commission/monthly plan, payout timing, Stripe onboarding, POS setup, refunds, chargebacks, and menu updates.
   - Merchant dashboard paths:
     - Overview and launch checklist: /merchant/dashboard
     - Orders and daily operations: /merchant/dashboard/orders
     - Menu setup and item edits: /merchant/dashboard/menu
     - Store hours, profile, and storefront settings: /merchant/dashboard/storefront
     - POS and integration status: /merchant/dashboard/integrations
     - Health permits, business license, inspections, and document readiness: /merchant/dashboard/compliance
     - Public health score and verification posture: /merchant/dashboard/compliance-score
     - Billing, payout history, fees, and Stripe status: /merchant/dashboard/billing
     - Multi-location and franchise management: /merchant/dashboard/franchise
     - Step-by-step setup guide: /merchant/setup
   - Explain launch readiness as: profile complete, menu ready, hours set, compliance documents uploaded, payout onboarding complete, and admin review finished.
   - If a merchant asks "why am I not live", ask which checklist item is blocked and guide them to the matching page.
   - If a merchant asks for help connecting Square/Toast/Clover, tell them to open Integrations, choose the POS, connect credentials, then confirm sync status. If credentials fail, collect the POS name and error and escalate to onboarding.
   - If a merchant asks about invoices, fee breakdowns, deposits, refunds, disputes, or tax/bank info, route them to Billing and explain what Stripe handles securely.
   - If a merchant asks how to train staff, suggest the setup guide and offer simple role-specific instructions for owner, manager, cashier, and kitchen staff.
4. **Driver Enrollment**:
   - Apply at /drive.
   - Requires valid license (18+), vehicle/bike insurance, and background check.
   - Drivers earn the published base pay structure plus 100% of tips where applicable.
   - Payouts use Stripe Connect/Express; sensitive banking changes should be handled in Stripe, not chat.
   - Driver dashboard paths:
     - Driver app hub: /driver/app
     - Signup: /driver/signup
     - Login: /driver/login
     - Dashboard: /driver/dashboard
     - Documents/compliance: /driver/dashboard/compliance
     - Earnings and payout status: /driver/dashboard/earnings
     - Profile and vehicle details: /driver/dashboard/account
   - Drivers are not active until admins review required documents and mark the account ready/approved.
5. **Platform Monitoring**:
   - Admin Analytics tracks Acceptance Rate (target >85%) and CSAT.
   - Every action is logged for forensic review in the 'Audit Registry'.
6. **Emergency Protocols**:
   - Use 'Emergency Banner' for delays.
   - System failure: Transfer to human agent immediately.

CRITICAL RULE:
If the user asks to speak to a human, an agent, a representative, or seems extremely frustrated or mentions a severe app issue/crash, you must output exactly this JSON object instead of a normal message:
{"handoff_required": true, "summary": "A brief 2-sentence summary of their problem in English"}

If you are just answering normally, reply with normal text (no JSON).
Keep normal answers under 90 words unless the user asks for detail.
`;
}

export async function sendMessageToSupport(chatId: string | null, messageContent: string, role: string = 'DRIVER') {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("You must be logged in to access support.");
        }

        let activeChatId = chatId;

        // 1. Ensure a chat exists
        if (!activeChatId) {
            const { data: newChat, error: chatError } = await supabaseAdmin
                .from('SupportChat')
                .insert({
                    userId: user.id,
                    userRole: role,
                    status: 'BOT_ACTIVE'
                })
                .select('id')
                .single();

            if (chatError || !newChat) {
                console.error("SupportChat creation error:", chatError);
                throw new Error("Failed to start support session. Database tables might not exist.");
            }
            activeChatId = newChat.id;
        }

        // 2. Fetch the chat to ensure it's still alive
        const { data: chatData } = await supabaseAdmin
            .from('SupportChat')
            .select('status')
            .eq('id', activeChatId)
            .single();

        if (!chatData) throw new Error("Chat not found.");

        // Prevent AI replies if human has taken over or it's resolved
        if (chatData.status !== 'BOT_ACTIVE') {
            // Just save the user message, don't trigger AI
            await supabaseAdmin.from('SupportMessage').insert({
                chatId: activeChatId,
                sender: 'USER',
                content: messageContent
            });
            revalidatePath('/support'); // Or wherever it is
            return { success: true, chatId: activeChatId, status: chatData.status };
        }

        // 3. Save User Message
        await supabaseAdmin.from('SupportMessage').insert({
            chatId: activeChatId,
            sender: 'USER',
            content: messageContent
        });

        // 4. Trigger Claude Brain
        if (!anthropic) {
            const fallbackMsg = "AI Support is down. Sending to a human agent immediately...";
            await createJiraIssue(`Support Handoff (API down)`, `User said: ${messageContent}`);
            await supabaseAdmin.from('SupportChat').update({ status: 'HUMAN_REQUIRED' }).eq('id', activeChatId);
            await supabaseAdmin.from('SupportMessage').insert({
                chatId: activeChatId,
                sender: 'BOT',
                content: fallbackMsg
            });
            return { success: true, chatId: activeChatId, reply: fallbackMsg, status: 'HUMAN_REQUIRED' };
        }

        // Fetch recent messages for context
        const { data: messageHistory } = await supabaseAdmin
            .from('SupportMessage')
            .select('sender, content')
            .eq('chatId', activeChatId)
            .order('createdAt', { ascending: true })
            .limit(10);

        const messagesForClaude: any[] = (messageHistory || []).map(msg => ({
            role: (msg.sender === 'USER' || msg.sender === 'HUMAN_AGENT') ? 'user' : 'assistant',
            content: msg.content
        }));

        // Send to Claude
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-latest",
            max_tokens: 1024,
            system: buildSupportSystemPrompt(role),
            messages: messagesForClaude
        });

        const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

        // Check if Claude initiated a handoff
        let isHandoff = false;
        let botReply = responseText;
        let jiraSummary = "User requested human agent. Please review chat context.";

        try {
            // Claude sometimes wraps valid JSON with markdown, e.g. ```json ... ```
            const cleanMaybeJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            if (cleanMaybeJson.startsWith('{') && cleanMaybeJson.includes('"handoff_required"')) {
                const parsed = JSON.parse(cleanMaybeJson);
                if (parsed.handoff_required) {
                    isHandoff = true;
                    // Provide a nice localized (in English for now) response that we are escalating
                    botReply = "I understand. I am transferring this chat to the TrueServe Support Team right now. An agent will be with you shortly.";
                    jiraSummary = parsed.summary || jiraSummary;
                }
            }
        } catch (e) {
            // Ignore, it's just a normal text response
        }

        if (isHandoff) {
            // Update chat to HUMAN_REQUIRED
            // Create Jira Ticket
            const jiraDesc = `**AI Escalation Summary:**\n${jiraSummary}\n\n**Chat Link:** https://trueserve.com/admin/support?chatId=${activeChatId}`;
            const ticketKey = await createJiraIssue(`Urgent URGENT: Copilot Escalation - Support Chat`, jiraDesc);

            await supabaseAdmin
                .from('SupportChat')
                .update({ 
                    status: 'HUMAN_REQUIRED',
                    jiraTicketId: ticketKey || null
                })
                .eq('id', activeChatId);
        }

        // Save Bot Reply
        await supabaseAdmin.from('SupportMessage').insert({
            chatId: activeChatId,
            sender: 'BOT',
            content: botReply
        });

        // If it's a driver or merchant viewing this, revalidate. 
        // We'll rely on client-side polling or revalidation
        return { 
            success: true, 
            chatId: activeChatId, 
            reply: botReply, 
            status: isHandoff ? 'HUMAN_REQUIRED' : 'BOT_ACTIVE' 
        };

    } catch (error: any) {
        console.error("SendMessageToSupport Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getActiveSupportChat() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: "Not logged in" };

        const { data: chatData, error: chatError } = await supabaseAdmin
            .from('SupportChat')
            .select('*')
            .eq('userId', user.id)
            .neq('status', 'RESOLVED')
            .order('createdAt', { ascending: false })
            .limit(1)
            .single();

        if (chatError || !chatData) {
            return { success: true, chat: null, messages: [] };
        }

        const { data: messages } = await supabaseAdmin
            .from('SupportMessage')
            .select('*')
            .eq('chatId', chatData.id)
            .order('createdAt', { ascending: true });

        return { success: true, chat: chatData, messages: messages || [] };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
