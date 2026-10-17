import { createHash } from 'crypto';

/**
 * Deterministically serializes an object with sorted keys
 * to ensure cryptographic hash stability.
 */
export function canonicalJsonStringify(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return `[${obj.map(canonicalJsonStringify).join(',')}]`;
  }

  const sortedKeys = Object.keys(obj as Record<string, unknown>).sort();
  const keyValues = sortedKeys.map(
    (key) => `${JSON.stringify(key)}:${canonicalJsonStringify((obj as Record<string, unknown>)[key])}`
  );

  return `{${keyValues.join(',')}}`;
}

/**
 * Computes an SHA-256 cryptographic hash of a canonicalized data structure.
 */
export function computeSha256Hash(data: unknown): string {
  const canonicalString = canonicalJsonStringify(data);
  return createHash('sha256').update(canonicalString, 'utf8').digest('hex');
}

/**
 * Verifies whether a given dataset matches an existing SHA-256 content hash.
 */
export function verifySha256Hash(data: unknown, expectedHash: string): boolean {
  const computed = computeSha256Hash(data);
  return computed === expectedHash;
}
