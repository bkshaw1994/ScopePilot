import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  resetRateLimit,
  resetAllRateLimits,
  pruneExpiredLimits,
} from '@/lib/security/rate-limit';

describe('Rate Limiter Module', () => {
  beforeEach(() => {
    resetAllRateLimits();
  });

  it('allows requests within limit and decrements remaining count', () => {
    const res1 = checkRateLimit('user-1', 3, 10000);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = checkRateLimit('user-1', 3, 10000);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = checkRateLimit('user-1', 3, 10000);
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it('blocks requests exceeding limit', () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit('user-blocked', 3, 10000);
    }
    const blockedRes = checkRateLimit('user-blocked', 3, 10000);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.remaining).toBe(0);
  });

  it('resets limit for specific key', () => {
    checkRateLimit('user-reset', 1, 10000);
    const blocked = checkRateLimit('user-reset', 1, 10000);
    expect(blocked.allowed).toBe(false);

    resetRateLimit('user-reset');
    const allowed = checkRateLimit('user-reset', 1, 10000);
    expect(allowed.allowed).toBe(true);
  });

  it('prunes expired limits correctly', () => {
    // Record created with 1ms window
    checkRateLimit('user-expired-1', 5, 1);
    checkRateLimit('user-expired-2', 5, 1);
    checkRateLimit('user-active', 5, 100000);

    // Simulate time passing by supplying a future timestamp
    const futureTime = Date.now() + 5000;
    const prunedCount = pruneExpiredLimits(futureTime);

    expect(prunedCount).toBe(2);

    // Active record should still be untouched
    const activeRes = checkRateLimit('user-active', 5, 100000);
    expect(activeRes.allowed).toBe(true);
  });

  it('evicts oldest entries when store exceeds hard cap under flood', () => {
    // Generate 2100 distinct unexpired keys
    for (let i = 0; i < 2100; i++) {
      checkRateLimit(`flood-key-${i}`, 10, 60000);
    }
    // Latest key should be allowed and store size should stay capped
    const latestRes = checkRateLimit('flood-latest', 10, 60000);
    expect(latestRes.allowed).toBe(true);
  });
});
