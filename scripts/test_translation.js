
const dotenv = require('dotenv');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

dotenv.config({ path: '.env.local' });
if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
    dotenv.config();
}

async function testTranslation() {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

    console.log("--- TrueServe Translation Diagnostic ---");

    if (!apiKey || apiKey === "YOUR_TRANSLATE_API_KEY_HERE" || apiKey === "") {
        console.error("❌ ERROR: GOOGLE_TRANSLATE_API_KEY is not set or is still the placeholder in .env");
        process.exit(1);
    }

    console.log(`Using Key ending in: ...${apiKey.substring(apiKey.length - 8)}`);

    const testText = "Hello, your order is arriving soon!";
    const targetLang = "es"; // Spanish

    console.log(`Original: "${testText}"`);
    console.log(`Target: ${targetLang}`);
    console.log("Connecting to Google Translation API...");

    try {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                q: testText,
                target: targetLang,
                format: 'text'
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("\n❌ GOOGLE API ERROR:");
            console.error(JSON.stringify(data.error, null, 2));

            if (data.error.status === "PERMISSION_DENIED") {
                console.log("\n💡 TIP: Ensure the 'Cloud Translation API' is ENABLED in your Google Cloud Project at:");
                console.log("https://console.cloud.google.com/apis/library/translate.googleapis.com");
            }
            if (data.error.message && data.error.message.includes("API key not valid")) {
                console.log("\n💡 TIP: Your API key appears to be invalid or restricted.");
            }
            process.exit(1);
        }

        const translated = data.data.translations[0].translatedText;
        console.log(`\n✅ SUCCESS!`);
        console.log(`Translated Result: "${translated}"`);
        console.log(`Provider reported: Google Cloud Translation`);

    } catch (err) {
        console.error("\n❌ UNEXPECTED SYSTEM ERROR:");
        console.error(err.message);
    }
}

testTranslation();
