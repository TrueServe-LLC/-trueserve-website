import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

export type SentimentAnalysis = {
    sentimentScore: number; // 0 to 100
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendation: string;
};

export async function analyzeMerchantSentiment(reviews: { comment: string, rating: number }[]): Promise<SentimentAnalysis> {
    if (!anthropic) {
        return {
            sentimentScore: 0,
            summary: "AI analysis is currently unavailable.",
            strengths: [],
            weaknesses: [],
            recommendation: "Please configure your ANTHROPIC_API_KEY."
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
    
    Respond ENTIRELY in valid JSON format. Do not use markdown blocks.
    Return ONLY the raw JSON object, starting with { and ending with }.
    
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
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-latest",
            max_tokens: 1000,
            temperature: 0.2,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

        const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
        if (!responseText) throw new Error("No data returned from AI");

        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
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
