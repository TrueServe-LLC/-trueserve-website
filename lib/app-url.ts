export function getAppBaseUrl() {
    const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
    if (vercelUrl) {
        const host = vercelUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "");
        return `https://${host}`;
    }

    const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://trueserve.delivery";
    return configured.replace(/\/+$/, "");
}
