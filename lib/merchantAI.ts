
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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
    if (!GEMINI_API_KEY) {
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
    
    Structure your response as valid JSON:
    {
        "gamePlan": "A concise, motivating 1-sentence action for today.",
        "criticalAlert": "Optional 1-sentence warning if there are bad reviews or stock issues.",
        "opportunity": "A 1-sentence suggestion for increasing revenue or efficiency."
    }
    `;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        responseMimeType: "application/json"
                    }
                })
            }
        );

        if (!response.ok) throw new Error("Briefing failed");
        const json = await response.json();
        return JSON.parse(json.candidates[0].content.parts[0].text);
    } catch (e) {
        console.error("[Merchant AI] Briefing Error:", e);
        return {
            gamePlan: "Monitor your dashboard for incoming orders and maintain service speed.",
            opportunity: "Check your stock levels for high-demand items."
        };
    }
}
