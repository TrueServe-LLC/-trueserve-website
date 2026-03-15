
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export type SentimentAnalysis = {
    sentimentScore: number; // 0 to 100
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendation: string;
};

export async function analyzeMerchantSentiment(reviews: { comment: string, rating: number }[]): Promise<SentimentAnalysis> {
    if (!GEMINI_API_KEY) {
        return {
            sentimentScore: 0,
            summary: "AI analysis is currently unavailable.",
            strengths: [],
            weaknesses: [],
            recommendation: "Please configure your GEMINI_API_KEY."
        };
    }

    if (reviews.length === 0) {
        return {
            sentimentScore: 100,
            summary: "No reviews yet. You're starting with a clean slate!",
            strengths: ["New store"],
            weaknesses: [],
            recommendation: "Encourage your first customers to leave feedback!"
        };
    }

    const reviewsText = reviews.map(r => `[Rating: ${r.rating}/5] ${r.comment}`).join('\n');

    const prompt = `
    You are an expert hospitality consultant and sentiment analyst for a premium food delivery app called TrueServe.
    Analyze the following customer reviews for a restaurant and provide a detailed "Customer Pulse" report.
    
    Reviews:
    ${reviewsText}
    
    Respond ENTIRELY in valid JSON format.
    Required JSON structure:
    {
        "sentimentScore": number, // 0 to 100 (where 100 is perfect)
        "summary": "Concise 1-2 sentence overview of customer mood",
        "strengths": ["list", "of", "3", "positives"],
        "weaknesses": ["list", "of", "areas", "for", "improvement"],
        "recommendation": "One specific actionable advice for the owner"
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
                        temperature: 0.2,
                        responseMimeType: "application/json"
                    }
                })
            }
        );

        if (!response.ok) throw new Error("AI analysis failed");

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) throw new Error("No data returned from AI");

        return JSON.parse(responseText);
    } catch (e) {
        console.error("[Sentiment AI] Error:", e);
        return {
            sentimentScore: 50,
            summary: "Unable to parse customer sentiment at this time.",
            strengths: [],
            weaknesses: [],
            recommendation: "Manual review recommended."
        };
    }
}
