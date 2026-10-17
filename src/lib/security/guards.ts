import { createServerClient } from '@/lib/db/server';
import { Database } from '@/types/database.types';

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Authentication required', details?: unknown) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied to this resource', details?: unknown) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: unknown) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid input payload', details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict or immutability violation', details?: unknown) {
    super(message, 409, 'CONFLICT', details);
  }
}

export interface UserSession {
  userId: string;
  email: string;
}

/**
 * Checks whether the environment permits local offline fallback mode.
 * Strictly forbidden in production (NODE_ENV === 'production').
 */
export function isLocalDevFallbackAllowed(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url.includes('your-project-id');
}

/**
 * Asserts the caller has an active, valid Supabase session.
 * Throws 401 AuthorizationError if unauthenticated.
 */
export async function assertAuthenticated(): Promise<UserSession> {
  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthorizationError('You must be signed in to perform this action.');
  }

  return {
    userId: user.id,
    email: user.email || '',
  };
}

type ProjectRow = Database['public']['Tables']['projects']['Row'];

/**
 * Asserts the caller owns the specified project.
 * Throws 403 ForbiddenError if user does not have permission.
 */
export async function assertProjectAccess(projectId: string, userId: string): Promise<ProjectRow> {
  const supabase = createServerClient();
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();

  if (error || !project) {
    throw new ForbiddenError('Project not found or you do not have permission to access it.');
  }

  return project;
}
