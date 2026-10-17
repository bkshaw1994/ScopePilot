interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory token bucket tracking per user/key
const memoryStore = new Map<string, RateLimitRecord>();
const MAX_STORE_SIZE_BEFORE_PRUNE = 500;
const MAX_HARD_CAP = 2000;

/**
 * Removes all expired rate limit records to prevent memory leaks over time.
 * Returns the count of removed records.
 */
export function pruneExpiredLimits(now: number = Date.now()): number {
  let pruned = 0;
  for (const [key, record] of memoryStore.entries()) {
    if (now >= record.resetAt) {
      memoryStore.delete(key);
      pruned += 1;
    }
  }
  return pruned;
}

/**
 * Enforces rate limiting per identifier (e.g. userId or projectId).
 * Returns true if allowed, false if limit exceeded.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 60 * 1000 // 1 hour default
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();

  // Guard memory growth: prune if cache exceeds size threshold
  if (memoryStore.size >= MAX_STORE_SIZE_BEFORE_PRUNE) {
    pruneExpiredLimits(now);

    // Hard ceiling defense: if unexpired unique keys flood store, evict oldest entries
    if (memoryStore.size >= MAX_HARD_CAP) {
      const keys = memoryStore.keys();
      for (let i = 0; i < 500; i++) {
        const nextKey = keys.next().value;
        if (nextKey !== undefined) {
          memoryStore.delete(nextKey);
        }
      }
    }
  }

  const record = memoryStore.get(key);

  if (!record || now >= record.resetAt) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    memoryStore.set(key, newRecord);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: newRecord.resetAt,
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

export function resetRateLimit(key: string): void {
  memoryStore.delete(key);
}

export function resetAllRateLimits(): void {
  memoryStore.clear();
}
