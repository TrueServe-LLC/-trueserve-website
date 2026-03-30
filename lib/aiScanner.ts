import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Initialize Anthropic client if key exists
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

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
 * Scans an identity document or vehicle document using Claude 3.5 Sonnet Vision.
 * Identifies if it's a valid driver's license, insurance card, or registration,
 * and extracts key details for AI auto-verification.
 */
export async function scanDocumentWithAI(file: File | null): Promise<ScanResult> {
    if (!file) {
        return { isValid: false, confidence: 0, extractedData: {}, error: "No file provided." };
    }
    if (!anthropic) {
        console.warn("[AI Scanner] ANTHROPIC_API_KEY is missing. Using fallback mock.");
        return { isValid: false, confidence: 0, extractedData: {}, error: "AI Scanner is not configured." };
    }

    try {
        const mimeType = file.type;
        const buffer = await file.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');

        // Verify valid mime type for Claude (jpeg, png, webp, gif)
        // Claude doesn't directly support PDFs in the vision endpoint without PDF beta features, 
        // so we'll allow images here.
        const validMimeTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
        if (!validMimeTypes.includes(mimeType)) {
            return {
                isValid: false,
                confidence: 0,
                extractedData: {},
                error: `Unsupported file type: ${mimeType}. Please upload a clear image (JPG/PNG).`
            };
        }

        const prompt = `
You are a strict, automated document verification AI acting as a compliance officer for a delivery app.
Analyze the provided document (Driver's License, Vehicle Insurance, or Vehicle Registration).
Extract the information and respond ENTIRELY in valid JSON format. Do not use markdown blocks like \`\`\`json.
Return ONLY the raw JSON object, starting with { and ending with }.

Required JSON structure:
{
    "isValid": boolean, // True if the document looks like a legitimate license, insurance, or registration. False if blurry, fake, or a random image.
    "confidence": number, // 0.0 to 1.0 confidence score
    "documentType": "LICENSE" | "INSURANCE" | "REGISTRATION" | "UNKNOWN",
    "name": string | null, // The full name listed on the document
    "dob": string | null, // Date of birth (YYYY-MM-DD), if applicable
    "expirationDate": string | null, // Expiration date (YYYY-MM-DD), if found
    "isExpired": boolean // True if the expiration date is in the past compared to today Date.
}`;

        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-latest",
            max_tokens: 1024,
            temperature: 0.1,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: mimeType as any,
                                data: base64Data
                            }
                        }
                    ]
                }
            ]
        });

        const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
        if (!responseText) {
            throw new Error("No text returned from Claude API");
        }

        // Clean any potential markdown Claude might still add
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed: ScanResult['extractedData'] & Pick<ScanResult, 'isValid' | 'confidence'> = JSON.parse(cleanJson);

        return {
            isValid: parsed.isValid ?? false,
            confidence: parsed.confidence ?? 0,
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
 * Uses Claude 3.5 Sonnet to detect if the image contains a clear human face and appears to be a live photograph.
 */
export async function verifyDriverIdentityWithAI(imageFile: Blob): Promise<{ success: boolean; confidence: number; reason?: string }> {
    if (!anthropic) {
        return { success: false, confidence: 0, reason: "AI Spot Check is not configured." };
    }

    try {
        const buffer = await imageFile.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');
        const mimeType = imageFile.type;

        const prompt = `
You are an advanced security AI performing an identity Spot Check for a delivery driver.
Analyze this image and respond ENTIRELY in valid JSON format. Do not use markdown blocks.
Return ONLY the raw JSON object, starting with { and ending with }.

Required JSON structure:
{
    "isHumanFace": boolean, // True if the image clearly contains exactly one human face.
    "isLivePhoto": boolean, // True if the image appears to be a live selfie (e.g., proper lighting, no visible screen borders, no glare from a picture of a picture).
    "confidence": number, // 0.0 to 1.0 confidence score
    "reason": string // If it fails, concisely explain why (e.g., "Multiple faces detected", "Appears to be a photo of a screen", "Too blurry")
}`;

        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-latest",
            max_tokens: 1024,
            temperature: 0.1,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: mimeType as any,
                                data: base64Data
                            }
                        }
                    ]
                }
            ]
        });

        const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
        if (!responseText) throw new Error("No text returned from Claude API");

        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

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

/**
 * AI Menu Scanner: Extracts restaurant details and menu items from a photo.
 * Used for automated merchant onboarding.
 */
export type MenuScanResult = {
    restaurantName: string | null;
    address: string | null;
    phone: string | null;
    description: string;
    menuItems: Array<{
        name: string;
        description: string;
        price: number;
        category?: string;
        imageUrl: string | null;
        photoBox: {
            x: number;
            y: number;
            width: number;
            height: number;
        } | null;
    }>;
    confidence: number;
    hasImages: boolean;
};

export async function scanRestaurantMenuWithAI(file: File): Promise<MenuScanResult | null> {
    if (!anthropic) {
        return null;
    }

    try {
        const buffer = await file.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');
        const mimeType = file.type;

        const prompt = `
You are a high-level automated menu digitizer, similar to those used by DoorDash and Uber Eats.
Analyze this photo of a restaurant menu and extract ALL relevant information with extreme precision.

Tasks:
1. Identify Restaurant Name, Address, and Phone.
2. Create a marketing-friendly description of the restaurant.
3. List every menu item with its name, description, and price.
4. CRITICAL: For each menu item, if there is a picture of the food next to it, output the "photoBox" coordinates (top, left, height, width as percentages 0 to 100).

Respond ENTIRELY in valid JSON format. Do not use markdown blocks.
Return ONLY the raw JSON object, starting with { and ending with }.

Required JSON structure:
{
    "restaurantName": string | null,
    "address": string | null,
    "phone": string | null,
    "description": string,
    "menuItems": [
        {
            "name": string,
            "description": string,
            "price": number,
            "category": string,
            "imageUrl": string | null,
            "photoBox": { "x": number, "y": number, "width": number, "height": number } | null
        }
    ],
    "confidence": number,
    "hasImages": boolean
}`;

        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-latest",
            max_tokens: 4096, // Lots of text output for menus
            temperature: 0.1,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: mimeType as any,
                                data: base64Data
                            }
                        }
                    ]
                }
            ]
        });

        const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
        if (!responseText) throw new Error("No text returned from Claude API");

        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return parsed as MenuScanResult;

    } catch (e) {
        console.error("[AI Menu Scanner] Error:", e);
        return null;
    }
}
