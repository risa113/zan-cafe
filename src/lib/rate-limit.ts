/**
 * Production-ready In-Memory Sliding-Window Rate Limiter
 * Protects against brute-force attacks, credential stuffing, order flooding, and API abuse.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((record, key) => {
      // Retain only timestamps from the last 15 minutes
      const valid = record.timestamps.filter((ts) => now - ts < 15 * 60 * 1000);
      if (valid.length === 0) {
        rateLimitStore.delete(key);
      } else {
        record.timestamps = valid;
      }
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  windowMs: number; // e.g. 60 * 1000 (1 minute) or 15 * 60 * 1000 (15 minutes)
  max: number;      // Maximum requests allowed in that window
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Remove timestamps outside current sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= options.max) {
    const oldest = record.timestamps[0];
    const resetInSeconds = Math.max(1, Math.ceil((oldest + options.windowMs - now) / 1000));
    return {
      success: false,
      limit: options.max,
      remaining: 0,
      resetInSeconds,
    };
  }

  record.timestamps.push(now);

  const resetInSeconds = Math.ceil(options.windowMs / 1000);
  return {
    success: true,
    limit: options.max,
    remaining: options.max - record.timestamps.length,
    resetInSeconds,
  };
}

/**
 * Extracts a reliable client IP from headers (X-Forwarded-For, X-Real-IP, CF-Connecting-IP)
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}

