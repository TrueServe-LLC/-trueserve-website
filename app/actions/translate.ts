"use server";

const GOOGLE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;

export async function translateText(text: string, targetLang: string = 'en') {
    // 1. Try DeepL First (Preferred for quality)
    if (DEEPL_API_KEY) {
        try {
            // Determine endpoint: Free vs Pro (Keys ending in :fx are free)
            const isFree = DEEPL_API_KEY.endsWith(':fx');
            const url = isFree
                ? 'https://api-free.deepl.com/v2/translate'
                : 'https://api.deepl.com/v2/translate';

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: [text],
                    target_lang: targetLang.toUpperCase() // DeepL expects uppercase (EN, ES)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("DeepL Error:", data);
                // Fallthrough to Google if DeepL fails? Or just return error?
                // Returning error is safer to avoid surprise bills on the other account.
                return { error: data.message || "DeepL Translation failed" };
            }

            return { translatedText: data.translations[0].text, provider: 'DeepL' };

        } catch (e: any) {
            console.error("DeepL Exception:", e);
            // Proceed to Google fallback if desired, or return error.
        }
    }

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
