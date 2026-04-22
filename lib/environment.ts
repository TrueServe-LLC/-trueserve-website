export type RuntimeEnvironment = "development" | "preview" | "production";

export function getRuntimeEnvironment(): RuntimeEnvironment {
    const vercelEnv = (process.env.VERCEL_ENV || "").toLowerCase();
    if (vercelEnv === "production" || vercelEnv === "preview" || vercelEnv === "development") {
        return vercelEnv;
    }

    return process.env.NODE_ENV === "production" ? "production" : "development";
}

export function isProductionEnvironment(): boolean {
    return getRuntimeEnvironment() === "production";
}

export function isNonProductionEnvironment(): boolean {
    return !isProductionEnvironment();
}

