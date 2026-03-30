import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

export type MerchantBriefing = {
    gamePlan: string;
    criticalAlert?: string;
    opportunity: string;
};

export async function generateMerchantBriefing(data: {
    restaurantName: string,
    recentOrders: any[],
    reviews: any[],
    outOfStock: string[]
}): Promise<MerchantBriefing> {
    if (!anthropic) {
        return {
            gamePlan: "Focus on providing excellent service and maintaining food quality today.",
            opportunity: "Watch your peak hours to optimize staff scheduling."
        };
    }

    const orderStats = `Recent Orders: ${data.recentOrders.length}, Out of Stock: ${data.outOfStock.join(', ') || 'None'}`;
    const reviewsSummary = data.reviews.map(r => `[${r.rating} stars] ${r.comment}`).join(' | ').slice(0, 1000);

    const prompt = `
    You are an AI business consultant for a restaurant owner at TrueServe.
    Based on the following data for "${data.restaurantName}", provide a 3-sentence "Morning Briefing" game plan.
    Data: ${orderStats}. Reviews: ${reviewsSummary}.
    
    Structure your response as valid JSON ONLY. Do not use markdown blocks.
    {
        "gamePlan": "A concise, motivating 1-sentence action for today.",
        "criticalAlert": "Optional 1-sentence warning if there are bad reviews or stock issues.",
        "opportunity": "A 1-sentence suggestion for increasing revenue or efficiency."
    }
    `;

    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-latest",
            max_tokens: 500,
            temperature: 0.7,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

        const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (e) {
        console.error("[Merchant AI] Briefing Error:", e);
        return {
            gamePlan: "Monitor your dashboard for incoming orders and maintain service speed.",
            opportunity: "Check your stock levels for high-demand items."
        };
    }
}

export type MenuOptimization = {
    itemId: string;
    itemName: string;
    reason: string;
    suggestion: string;
    suggestedPrice: number;
};

export async function suggestMenuOptimizations(menuItems: any[], orders: any[]): Promise<MenuOptimization[]> {
    if (!anthropic || menuItems.length === 0) return [];

    const itemPerformance = menuItems.map(item => {
        const count = orders.filter(o => o.items?.some((i: any) => i.menuItemId === item.id)).length;
        return { id: item.id, name: item.name, price: item.price, orders: count };
    });

    const prompt = `
    You are a Menu Strategy AI for a delivery app.
    Based on the following item performance, suggest 2 items that could benefit from price adjustments or promotions.
    Items: ${JSON.stringify(itemPerformance)}
    
    Respond ENTIRELY in valid JSON ONLY without any markdown wrapping:
    [
        {
            "itemId": "string",
            "itemName": "string",
            "reason": "e.g., High price but low orders compared to others",
            "suggestion": "e.g., Drop price by $1 to attract new customers",
            "suggestedPrice": number
        }
    ]
    `;

    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-latest",
            max_tokens: 1000,
            temperature: 0.5,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

        const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (e) {
        console.error("[Merchant AI] Optimization Error:", e);
        return [];
    }
}
