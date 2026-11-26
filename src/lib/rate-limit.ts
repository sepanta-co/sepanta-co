interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const globalForRateLimit = globalThis as unknown as {
  __sepantaRateLimitStore?: Map<string, RateLimitEntry>;
};

function getStore(): Map<string, RateLimitEntry> {
  if (!globalForRateLimit.__sepantaRateLimitStore) {
    globalForRateLimit.__sepantaRateLimitStore = new Map();
  }
  return globalForRateLimit.__sepantaRateLimitStore;
}

function pruneExpired(store: Map<string, RateLimitEntry>, now: number): void {
  if (store.size < 200) return;
  for (const [key, entry] of store.entries()) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}

export function getClientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  return "127.0.0.1";
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
} {
  const now = Date.now();
  const store = getStore();
  pruneExpired(store, now);

  const existing = store.get(key);
  if (!existing || now >= existing.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      retryAfterSec: 0,
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSec: 0,
  };
}
