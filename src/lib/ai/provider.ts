import { z } from 'zod';
import { wrapUntrustedClientText } from '@/lib/security/sanitize';

export interface AIUsageMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface AIStructuredOutputRequest<T> {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T, any, any>;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  schemaName?: string;
}

export interface AIStructuredOutputResponse<T> {
  data: T;
  usage: AIUsageMetrics;
  model: string;
  latencyMs: number;
  rawJson: string;
}

export interface AIProvider {
  name: string;
  generateStructured<T>(req: AIStructuredOutputRequest<T>): Promise<AIStructuredOutputResponse<T>>;
}

/**
 * Strips markdown code blocks like ```json ... ``` from LLM output
 */
export function extractJsonFromResponse(raw: string): string {
  let cleaned = raw.trim();

  // Match ```json ... ``` or ``` ... ```
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  }

  // Find outermost curly or square brackets if surrounding text exists
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  const start =
    firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)
      ? firstBrace
      : firstBracket;

  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');
  const end =
    lastBrace !== -1 && (lastBracket === -1 || lastBrace > lastBracket)
      ? lastBrace
      : lastBracket;

  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }

  return cleaned;
}
