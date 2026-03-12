

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export type ScanResult = {
    isValid: boolean;
    confidence: number; // 0.0 to 1.0
    extractedData: {
        name?: string;
        dob?: string;
        documentType?: 'LICENSE' | 'INSURANCE' | 'REGISTRATION' | 'UNKNOWN';
        expirationDate?: string;
        isExpired?: boolean;
    };
    error?: string;
};

/**
 * Scans an identity document or vehicle document using Gemini 1.5 Flash Vision API.
 * Identifies if it's a valid driver's license, insurance card, or registration,
 * and extracts key details for AI auto-verification.
 */
export async function scanDocumentWithAI(file: File | null): Promise<ScanResult> {
    if (!file) {
        return { isValid: false, confidence: 0, extractedData: {}, error: "No file provided." };
    }
    if (!GEMINI_API_KEY) {
        console.warn("[AI Scanner] GEMINI_API_KEY is missing. Using fallback mock.");
        return { isValid: false, confidence: 0, extractedData: {}, error: "AI Scanner is not configured." };
    }

    try {
        const mimeType = file.type;
        const buffer = await file.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');

        // Verify valid mime type for Gemini
        const validMimeTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
        if (!validMimeTypes.includes(mimeType)) {
            return {
                isValid: false,
                confidence: 0,
                extractedData: {},
                error: `Unsupported file type: ${mimeType}`
            };
        }

        const prompt = `
        You are a strict, automated document verification AI acting as a compliance officer for a delivery app.
        Analyze the provided document (Driver's License, Vehicle Insurance, or Vehicle Registration).
        Extract the information and respond ENTIRELY in valid JSON format. Do not use markdown blocks like \`\`\`json.
        
        Required JSON structure:
        {
            "isValid": boolean, // True if the document looks like a legitimate license, insurance, or registration. False if blurry, fake, or a random image.
            "confidence": number, // 0.0 to 1.0 confidence score
            "documentType": "LICENSE" | "INSURANCE" | "REGISTRATION" | "UNKNOWN",
            "name": string | null, // The full name listed on the document
            "dob": string | null, // Date of birth (YYYY-MM-DD), if applicable
            "expirationDate": string | null, // Expiration date (YYYY-MM-DD), if found
            "isExpired": boolean // True if the expirationdate is in the past compared to today Date.
        }
        `;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: prompt },
                                {
                                    inlineData: {
                                        mimeType: mimeType,
                                        data: base64Data
                                    }
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.1,
                        responseMimeType: "application/json"
                    }
                })
            }
        );

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Gemini API Error: ${response.status} - ${errBody}`);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            throw new Error("No text returned from Gemini API");
        }

        const parsed: ScanResult['extractedData'] & Pick<ScanResult, 'isValid' | 'confidence'> = JSON.parse(responseText);

        return {
            isValid: parsed.isValid,
            confidence: parsed.confidence,
            extractedData: {
                name: parsed.name ?? undefined,
                dob: parsed.dob ?? undefined,
                documentType: parsed.documentType ?? 'UNKNOWN',
                expirationDate: parsed.expirationDate ?? undefined,
                isExpired: parsed.isExpired ?? false,
            }
        };

    } catch (e: any) {
        console.error("[AI Scanner] Error:", e);
        return {
            isValid: false,
            confidence: 0,
            extractedData: {},
            error: e.message || "Unknown AI scanning error"
        };
    }
}

/**
 * AI Spot Check: Verifies a driver's live selfie to ensure account security.
 * Uses Gemini Vision API to detect if the image contains a clear human face and appears to be a live photograph.
 */
export async function verifyDriverIdentityWithAI(imageFile: Blob): Promise<{ success: boolean; confidence: number; reason?: string }> {
    if (!GEMINI_API_KEY) {
        return { success: false, confidence: 0, reason: "AI Spot Check is not configured." };
    }

    try {
        const buffer = await imageFile.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');
        const mimeType = imageFile.type;

        const prompt = `
        You are an advanced security AI performing an identity Spot Check for a delivery driver.
        Analyze this image and respond ENTIRELY in valid JSON format.
        
        Required JSON structure:
        {
            "isHumanFace": boolean, // True if the image clearly contains exactly one human face.
            "isLivePhoto": boolean, // True if the image appears to be a live selfie (e.g., proper lighting, no visible screen borders, no glare from a picture of a picture).
            "confidence": number, // 0.0 to 1.0 confidence score
            "reason": string // If it fails, concisely explain why (e.g., "Multiple faces detected", "Appears to be a photo of a screen", "Too blurry")
        }
        `;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: prompt },
                                {
                                    inlineData: {
                                        mimeType: mimeType,
                                        data: base64Data
                                    }
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.1,
                        responseMimeType: "application/json"
                    }
                })
            }
        );

        if (!response.ok) throw new Error("Gemini API Error");

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) throw new Error("No text returned from Gemini API");

        const parsed = JSON.parse(responseText);

        // Security logic: Must be a human face AND appear to be a real live photo with high confidence
        if (parsed.isHumanFace && parsed.isLivePhoto && parsed.confidence > 0.8) {
            return { success: true, confidence: parsed.confidence };
        } else {
            return { 
                success: false, 
                confidence: parsed.confidence || 0, 
                reason: parsed.reason || "Verification failed security threshold." 
            };
        }

    } catch (e: any) {
        console.error("[AI Spot Check] Error:", e);
        return { success: false, confidence: 0, reason: e.message || "Unknown error during AI face verification." };
    }
}
