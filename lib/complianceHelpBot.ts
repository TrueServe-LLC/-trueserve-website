import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

export type ComplianceContext = {
    userType: 'DRIVER' | 'MERCHANT';
    complianceScore: number;
    complianceStatus: string;
    incompleteItems: string[];
    recentViolations?: string[];
    lastInspectionDate?: string;
};

export type BotMessage = {
    id: string;
    sender: 'BOT' | 'USER';
    content: string;
    timestamp: Date;
    resourceLinks?: Array<{ title: string; url: string }>;
};

/**
 * Driver Compliance Help Bot
 * Provides contextual guidance on food safety training, bag sanitation, and temperature control
 */
export async function getComplianceHelp(
    question: string,
    context: ComplianceContext
): Promise<BotMessage> {
    if (!anthropic) {
        const fallbackContent = context.userType === 'MERCHANT'
            ? "I'm Serv, TrueServe's merchant guide. I can walk you through menu setup, POS connections, permits, payout readiness, and launch blockers. Human admins still verify documents and approve go-live."
            : "I'm Serv, TrueServe's compliance guide. I can help answer questions about food safety training, bag sanitation, and temperature control. Please check back when the system is fully configured.";
        return {
            id: Date.now().toString(),
            sender: 'BOT',
            content: fallbackContent,
            timestamp: new Date(),
        };
    }

    const contextSummary = buildContextSummary(context);
    const systemPrompt = buildSystemPrompt(context.userType);

    const prompt = `
${systemPrompt}

Current Driver/Merchant Status:
${contextSummary}

User Question: ${question}

Provide a helpful, friendly response that:
1. Directly answers their question
2. Relates to their specific compliance situation if applicable
3. Suggests actionable next steps
4. Keeps tone encouraging and supportive (2-3 sentences max)

If they're asking about training resources, include relevant links.
`;

    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-latest",
            max_tokens: 500,
            temperature: 0.7,
            messages: [
                {
                    role: "user",
                    content: prompt,
                }
            ]
        });

        const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

        // Extract any resource links from the response
        const resourceLinks = extractResourceLinks(responseText);

        return {
            id: Date.now().toString(),
            sender: 'BOT',
            content: responseText.trim(),
            timestamp: new Date(),
            resourceLinks,
        };
    } catch (error) {
        console.error("[Compliance Bot] Error:", error);
        return {
            id: Date.now().toString(),
            sender: 'BOT',
            content: "I'm having trouble responding right now. Please try again or contact support for immediate assistance.",
            timestamp: new Date(),
        };
    }
}

/**
 * Builds a helpful system prompt based on user type
 */
function buildSystemPrompt(userType: 'DRIVER' | 'MERCHANT'): string {
    if (userType === 'DRIVER') {
        return `You are a helpful Compliance Assistant for food delivery drivers at TrueServe.
Your role is to help drivers understand and maintain compliance with food safety standards.
Focus on: food safety training requirements, proper bag sanitation practices, temperature control for hot/cold items.
Be encouraging - compliance training helps drivers maintain their active status and earn better ratings from customers.`;
    } else {
        return `You are Serv, a helpful Merchant Portal and Compliance Assistant for restaurant owners at TrueServe.
Your role is to help merchants understand health inspection scores, compliance status, document readiness, and the exact portal path needed to move toward launch.
Focus on: common violations, inspection preparation, staff training, corrective actions, compliance improvements, business license/health permit uploads, POS connection status, menu readiness, payout readiness, and admin review next steps.

Merchant portal map:
- Overview and launch checklist: /merchant/dashboard
- Orders and day-of operations: /merchant/dashboard/orders
- Menu setup: /merchant/dashboard/menu
- Store hours, restaurant profile, and storefront settings: /merchant/dashboard/storefront
- POS connections: /merchant/dashboard/integrations
- Health permits, business license, inspections, and document readiness: /merchant/dashboard/compliance
- Compliance score: /merchant/dashboard/compliance-score
- Billing, fee breakdowns, payouts, and Stripe status: /merchant/dashboard/billing
- Multi-location management: /merchant/dashboard/franchise
- Simple setup guide: /merchant/setup

For non-technical merchants, answer with one to three clear steps and name the exact page to open.
Do not claim you can verify documents, mark a restaurant live, change tax/bank details, or approve launch. Those require human admin review.
Be solution-focused - help identify actionable steps to improve compliance scores and avoid flagging.`;
    }
}

/**
 * Builds a context summary from compliance data
 */
function buildContextSummary(context: ComplianceContext): string {
    let summary = `- Current Score: ${context.complianceScore}/100\n`;
    summary += `- Status: ${context.complianceStatus}\n`;

    if (context.incompleteItems.length > 0) {
        summary += `- Incomplete Items: ${context.incompleteItems.join(', ')}\n`;
    }

    if (context.recentViolations && context.recentViolations.length > 0) {
        summary += `- Recent Violations: ${context.recentViolations.slice(0, 3).join(', ')}\n`;
    }

    if (context.lastInspectionDate) {
        summary += `- Last Inspection: ${context.lastInspectionDate}\n`;
    }

    return summary;
}

/**
 * Extracts any resource links from bot response
 */
function extractResourceLinks(content: string): Array<{ title: string; url: string }> {
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links: Array<{ title: string; url: string }> = [];
    let match;

    while ((match = linkPattern.exec(content)) !== null) {
        links.push({ title: match[1], url: match[2] });
    }

    return links;
}

/**
 * Generates quick tips based on compliance status
 */
export function generateQuickTip(context: ComplianceContext, userType: 'DRIVER' | 'MERCHANT'): string {
    if (userType === 'DRIVER') {
        if (context.incompleteItems.includes('Food Safety Training')) {
            return "Tip Tip: Complete your food safety training to unlock full compliance status. This is essential for keeping your active driver badge.";
        }
        if (context.incompleteItems.includes('Bag Sanitation')) {
            return "Tip Tip: Ensure your delivery bag is clean and in good condition. Clean bags prevent food contamination and improve customer ratings.";
        }
        if (context.incompleteItems.includes('Temperature Control')) {
            return "Tip Tip: Use hot/cold packs appropriately. Keep hot items above 140°F and cold items below 40°F during delivery.";
        }
        return "Tip Tip: Your compliance is looking good! Keep up the great work maintaining your standards.";
    } else {
        if (context.complianceStatus === 'FLAGGED') {
            return "Warning Action Needed: Your location has been flagged. Review recent violations and submit a corrective action plan to your health inspector.";
        }
        if (context.complianceScore < 70) {
            return "Tip Tip: Your compliance score is below target. Focus on high-impact improvements like staff training and cleaning procedures.";
        }
        return "Tip Tip: Maintain regular cleaning schedules and staff training to keep your compliance score strong.";
    }
}
