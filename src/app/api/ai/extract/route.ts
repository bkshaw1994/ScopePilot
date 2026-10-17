import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/db/server';
import { assertAuthenticated, assertProjectAccess, isLocalDevFallbackAllowed } from '@/lib/security/guards';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { GeminiProvider } from '@/lib/ai/gemini';
import { ExtractRequirementsResultSchema } from '@/lib/validators/requirement';

const ExtractInputSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  rawText: z.string().min(10, 'Text must be at least 10 characters long').max(50000),
  documentType: z.enum(['notes', 'email', 'chat', 'spec', 'other']).default('notes'),
});

const EXTRACTION_SYSTEM_PROMPT = `You are a Principal Software Architect and Requirements Engineering Specialist.
Your task is to analyze raw client communication, notes, or informal requests, and extract a structured, unambiguous set of software requirements.
For each requirement:
- Assign a clear, professional requirement code (REQ-001, REQ-002, etc.).
- Give it an actionable title and clear technical description.
- Categorize it (functional, non_functional, integration, ui_ux, security, exclusion, or other).
- Assign priority (must_have, should_have, could_have, nice_to_have).
- Break down concrete acceptance criteria.
- Identify implicit assumptions, external dependencies, and explicit exclusions.
- Flag any ambiguous phrases as unresolvedQuestions.
- Separate general project exclusions and open clarification questions.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ExtractInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Validation failed', details: parsed.error.flatten() } },
        { status: 400 }
      );
    }

    const { projectId, rawText } = parsed.data;

    // Rate Limiting Check
    const rateLimit = checkRateLimit(`extract-${projectId}`, 20, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Rate limit exceeded for requirement extraction. Please try again later.' } },
        { status: 429 }
      );
    }

    const provider = new GeminiProvider();

    // Local / Offline demo mode
    if (isLocalDevFallbackAllowed()) {
      const response = await provider.generateStructured({
        systemPrompt: EXTRACTION_SYSTEM_PROMPT,
        userPrompt: rawText,
        schema: ExtractRequirementsResultSchema,
        schemaName: 'ExtractRequirementsResult',
        temperature: 0.1,
      });

      return NextResponse.json({
        success: true,
        data: {
          projectId,
          ...response.data,
          usage: response.usage,
          model: response.model,
          latencyMs: response.latencyMs,
        },
      });
    }

    // Authenticated Production Mode
    const { userId } = await assertAuthenticated();
    await assertProjectAccess(projectId, userId);
    const supabase = createServerClient();

    const response = await provider.generateStructured({
      systemPrompt: EXTRACTION_SYSTEM_PROMPT,
      userPrompt: rawText,
      schema: ExtractRequirementsResultSchema,
      schemaName: 'ExtractRequirementsResult',
      temperature: 0.1,
    });

    // Record usage metrics
    await supabase.from('usage_records').insert({
      user_id: userId,
      project_id: projectId,
      feature_type: 'requirement_extraction',
      model_name: response.model,
      prompt_tokens: response.usage.promptTokens,
      completion_tokens: response.usage.completionTokens,
      total_tokens: response.usage.totalTokens,
      estimated_cost_usd: response.usage.estimatedCostUsd,
    });

    // Record audit event
    await supabase.from('audit_events').insert({
      user_id: userId,
      project_id: projectId,
      event_type: 'requirements_extracted',
      entity_name: 'projects',
      entity_id: projectId,
      metadata: {
        requirements_count: response.data.requirements.length,
        exclusions_count: response.data.extractedExclusions.length,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        projectId,
        ...response.data,
        usage: response.usage,
        model: response.model,
        latencyMs: response.latencyMs,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
