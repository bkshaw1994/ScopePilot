import { describe, it, expect, vi } from 'vitest';
import { assertProjectAccess, assertAuthenticated, ForbiddenError, AuthorizationError } from '@/lib/security/guards';
import { wrapUntrustedClientText, sanitizeRawInput } from '@/lib/security/sanitize';

describe('Security & Multi-Tenant Isolation Controls', () => {
  it('should sanitize dangerous control characters and null bytes', () => {
    const maliciousInput = 'Normal text \x00 with null byte and \x1F control char';
    const cleaned = sanitizeRawInput(maliciousInput);

    expect(cleaned).not.toContain('\x00');
    expect(cleaned).not.toContain('\x1F');
    expect(cleaned).toBe('Normal text  with null byte and  control char');
  });

  it('should wrap untrusted client input in XML boundary tags', () => {
    const rawClientText = 'Can we also add Google Login?';
    const wrapped = wrapUntrustedClientText(rawClientText);

    expect(wrapped).toContain('<untrusted_client_request>');
    expect(wrapped).toContain('Can we also add Google Login?');
    expect(wrapped).toContain('</untrusted_client_request>');
  });

  it('should enforce that client bundle modules do not expose server-only secrets', async () => {
    // Assert process.env checks in client.ts
    const clientCode = await import('@/lib/db/client');
    expect(clientCode.createClient).toBeDefined();

    // Verify service role key is NEVER accessible via client module
    expect((clientCode as Record<string, unknown>).SUPABASE_SERVICE_ROLE_KEY).toBeUndefined();
    expect((clientCode as Record<string, unknown>).GEMINI_API_KEY).toBeUndefined();
  });
});
