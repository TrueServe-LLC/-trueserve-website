/**
 * TrueServe Rate Limiter
 * ----------------------
 * Lightweight in-memory rate limiter for API and webhook endpoints.
 * Uses a sliding window algorithm.
 * For production scale, replace the store with Redis (Upstash, etc.)
 */

interface RateLimitEntry {
    count: number;
    windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
    /** Max requests allowed in the window */
    limit: number;
    /** Window duration in seconds */
    windowSeconds: number;
}

/**
 * Check if a request from an IP should be rate limited.
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
    identifier: string,
    options: RateLimitOptions = { limit: 60, windowSeconds: 60 }
) {
    const now = Date.now();
    const windowMs = options.windowSeconds * 1000;

    const entry = store.get(identifier);

    if (!entry || now - entry.windowStart > windowMs) {
        // New window
        store.set(identifier, { count: 1, windowStart: now });
        return {
            allowed: true,
            remaining: options.limit - 1,
            resetAt: now + windowMs
        };
    }

    if (entry.count >= options.limit) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: entry.windowStart + windowMs
        };
    }

    entry.count += 1;
    return {
        allowed: true,
        remaining: options.limit - entry.count,
        resetAt: entry.windowStart + windowMs
    };
}

/**
 * Get client IP from Next.js request headers
 */
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    return request.headers.get('x-real-ip') || 'unknown';
}
