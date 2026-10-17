import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, resetRateLimit } from '@/lib/security/rate-limit';

describe('Rate Limiter', () => {
  const testKey = 'user_test_123';

  beforeEach(() => {
    resetRateLimit(testKey);
  });

  it('should allow requests within limit', () => {
    const res1 = checkRateLimit(testKey, 3, 1000);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = checkRateLimit(testKey, 3, 1000);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = checkRateLimit(testKey, 3, 1000);
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it('should reject requests exceeding limit', () => {
    checkRateLimit(testKey, 2, 1000);
    checkRateLimit(testKey, 2, 1000);

    const resBlocked = checkRateLimit(testKey, 2, 1000);
    expect(resBlocked.allowed).toBe(false);
    expect(resBlocked.remaining).toBe(0);
  });
});
