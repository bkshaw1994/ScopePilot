import { describe, it, expect } from 'vitest';
import { canonicalJsonStringify, computeSha256Hash, verifySha256Hash } from '@/lib/domain/hash';

describe('Cryptographic Hash & Canonicalization', () => {
  it('should serialize objects deterministically regardless of key order', () => {
    const objA = { b: 2, a: 1, c: { y: 'test', x: 10 } };
    const objB = { a: 1, c: { x: 10, y: 'test' }, b: 2 };

    expect(canonicalJsonStringify(objA)).toEqual(canonicalJsonStringify(objB));
  });

  it('should compute identical SHA-256 hash for identical data structures with different key order', () => {
    const data1 = {
      project: 'Acme',
      requirements: [
        { reqCode: 'REQ-001', title: 'Login' },
        { reqCode: 'REQ-002', title: 'Dashboard' }
      ]
    };

    const data2 = {
      requirements: [
        { title: 'Login', reqCode: 'REQ-001' },
        { title: 'Dashboard', reqCode: 'REQ-002' }
      ],
      project: 'Acme'
    };

    const hash1 = computeSha256Hash(data1);
    const hash2 = computeSha256Hash(data2);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // 64 hex characters for SHA-256
    expect(verifySha256Hash(data1, hash1)).toBe(true);
  });

  it('should detect tampering when requirement content changes', () => {
    const original = {
      version: 1,
      requirements: [{ reqCode: 'REQ-001', title: 'Login' }]
    };

    const tampered = {
      version: 1,
      requirements: [{ reqCode: 'REQ-001', title: 'Login with OAuth' }]
    };

    const originalHash = computeSha256Hash(original);
    expect(verifySha256Hash(tampered, originalHash)).toBe(false);
  });
});
