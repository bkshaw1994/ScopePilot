import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isLocalDevFallbackAllowed,
  AppError,
  AuthorizationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from '@/lib/security/guards';

describe('Security Guards & Fallback Safeguards', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('strictly forbids local dev fallback when NODE_ENV is production', () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://your-project-id.supabase.co';

    expect(isLocalDevFallbackAllowed()).toBe(false);

    process.env.NEXT_PUBLIC_SUPABASE_URL = undefined;
    expect(isLocalDevFallbackAllowed()).toBe(false);
  });

  it('permits local dev fallback when in development and placeholder URL is present', () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://your-project-id.supabase.co';

    expect(isLocalDevFallbackAllowed()).toBe(true);

    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    expect(isLocalDevFallbackAllowed()).toBe(true);
  });

  it('disables fallback in development when a real Supabase URL is configured', () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://xyzprodtest.supabase.co';

    expect(isLocalDevFallbackAllowed()).toBe(false);
  });

  it('constructs typed AppErrors with accurate HTTP status codes and error names', () => {
    const authErr = new AuthorizationError('Auth required');
    expect(authErr.statusCode).toBe(401);
    expect(authErr.code).toBe('UNAUTHORIZED');

    const forbiddenErr = new ForbiddenError('No access');
    expect(forbiddenErr.statusCode).toBe(403);
    expect(forbiddenErr.code).toBe('FORBIDDEN');

    const notFoundErr = new NotFoundError('Missing item');
    expect(notFoundErr.statusCode).toBe(404);
    expect(notFoundErr.code).toBe('NOT_FOUND');

    const validationErr = new ValidationError('Bad input', { field: 'name' });
    expect(validationErr.statusCode).toBe(400);
    expect(validationErr.code).toBe('VALIDATION_ERROR');
    expect(validationErr.details).toEqual({ field: 'name' });

    const conflictErr = new ConflictError('Baseline locked');
    expect(conflictErr.statusCode).toBe(409);
    expect(conflictErr.code).toBe('CONFLICT');
  });
});
