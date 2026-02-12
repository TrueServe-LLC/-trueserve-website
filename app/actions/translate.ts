"use server";

const GOOGLE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;

export async function translateText(text: string, targetLang: string = 'en') {
    // 1. Check for Google Translate Key First (Preferred per user request)
    // DeepL logic commented out to enforce Google Cloud consolidation
    /*
    if (DEEPL_API_KEY) {
        // ... DeepL logic ...
    }
    */

    // 2. Google Fallback
    if (!GOOGLE_API_KEY) {
        console.error("Missing Translation API Keys (Google or DeepL) in .env");
        return { error: "Translation service not configured" };
    }

    try {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                q: text,
                target: targetLang,
                format: 'text'
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Google Translate Error:", data.error);
            return { error: data.error.message };
        }

        // Extract translated text
        const translatedText = data.data.translations[0].translatedText;

        // Decode HTML entities if any (Google returns HTML escaped text sometimes)
        // Simple unescape for common chars
        const cleanText = translatedText
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&');

        return { translatedText: cleanText, provider: 'Google' };

    } catch (e: any) {
        console.error("Google Translation Exception:", e);
        return { error: "Failed to translate message." };
    }
}
