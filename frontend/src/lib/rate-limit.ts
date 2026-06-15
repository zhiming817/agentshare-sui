// Simple in-memory rate limiter for single-instance deployments.
// For multi-instance production, replace with Redis-backed (e.g. Upstash).

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}, 60_000);

export function rateLimit(
  key: string,
  options: { limit: number; windowMs: number } = {
    limit: 60,
    windowMs: 60_000,
  }
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    const resetTime = now + options.windowMs;
    store.set(key, { count: 1, resetTime });
    return { success: true, remaining: options.limit - 1, resetTime };
  }

  if (entry.count >= options.limit) {
    return { success: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count += 1;
  return {
    success: true,
    remaining: options.limit - entry.count,
    resetTime: entry.resetTime,
  };
}
