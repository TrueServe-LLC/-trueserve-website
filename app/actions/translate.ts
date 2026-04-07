"use server";

import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

export async function translateText(text: string, targetLang: string = 'en') {
    if (!anthropic) {
        console.error("Missing ANTHROPIC_API_KEY in .env");
        return { error: "Translation AI not configured" };
    }

    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-latest",
            max_tokens: 256,
            system: `Translate the following text into the ISO-639-1 language code '${targetLang}'. Return ONLY the translated text. Do not include any explanations, quotes, or markdown formatting.`,
            messages: [{ role: "user", content: text }]
        });

        const translatedText = response.content[0].type === 'text' ? response.content[0].text : '';

        if (!translatedText) {
            return { error: "Failed to parse AI response" };
        }

        return { translatedText: translatedText.trim(), provider: 'Claude' };

    } catch (e: any) {
        console.error("Claude Translation Exception:", e);
        return { error: "Failed to translate message." };
    }
}
