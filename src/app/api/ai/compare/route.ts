import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/server';
import { ScopeComparisonRequestSchema } from '@/lib/validators/scope-comparison';
import { assertAuthenticated, assertProjectAccess } from '@/lib/security/guards';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { runScopeComparison, BaselineRequirementContext } from '@/lib/domain/scope-engine';
import { GeminiProvider } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ScopeComparisonRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Validation failed', details: parsed.error.flatten() } },
        { status: 400 }
      );
    }

    const { projectId, newRequestText } = parsed.data;

    // Rate Limiting Check
    const rateLimit = checkRateLimit(projectId, 15, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Hourly AI comparison rate limit exceeded. Please try again later.' } },
        { status: 429 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
      // Mock / Local Demo Execution
      const mockBaseline: BaselineRequirementContext[] = [
        {
          reqCode: 'REQ-001',
          title: 'Email & Password Authentication',
          description: 'Users can register, sign in, and reset password.',
          category: 'functional',
          acceptanceCriteria: ['Min 8 characters', 'Email confirmation link'],
          exclusions: ['No SMS OTP'],
        },
        {
          reqCode: 'REQ-002',
          title: 'Daily Calorie & Macro Tracking Dashboard',
          description: 'Dashboard showing calories and macro distribution.',
          category: 'functional',
          acceptanceCriteria: ['Interactive pie chart', 'Goal progress bar'],
          exclusions: ['No AI barcode camera scan'],
        },
        {
          reqCode: 'REQ-EXCL-01',
          title: 'Explicit Exclusion: No Wearable Bluetooth Sync in v1.0',
          description: 'Direct Bluetooth sync with Apple Watch or Garmin is out of scope.',
          category: 'exclusion',
          acceptanceCriteria: ['Manual entry only'],
          exclusions: ['All Apple Watch / Fitbit background listeners'],
        },
      ];

      const comparison = await runScopeComparison({
        baselineRequirements: mockBaseline,
        newRequestText,
        provider: new GeminiProvider(),
      });

      return NextResponse.json({
        success: true,
        data: {
          id: `cmp-${Date.now().toString(36)}`,
          projectId,
          ...comparison.result,
          usage: comparison.usage,
          model: comparison.model,
          latencyMs: comparison.latencyMs,
          createdAt: new Date().toISOString(),
        },
      });
    }

    // Authenticated Database Execution
    const { userId } = await assertAuthenticated();
    await assertProjectAccess(projectId, userId);
    const supabase = createServerClient();

    // 1. Fetch active baseline version
    const { data: baselineVersion, error: baselineError } = await supabase
      .from('scope_versions')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_baseline', true)
      .single();

    if (baselineError || !baselineVersion) {
      return NextResponse.json(
        { success: false, error: { message: 'Project has no approved active baseline. Approve a baseline before running comparisons.' } },
        { status: 400 }
      );
    }

    const baselineRequirements = (baselineVersion.requirements_snapshot as unknown as BaselineRequirementContext[]) || [];

    // 2. Run Scope Comparison Engine
    const comparison = await runScopeComparison({
      baselineRequirements,
      newRequestText,
      provider: new GeminiProvider(),
    });

    // 3. Persist comparison parent record
    const { data: comparisonRecord, error: compInsertError } = await supabase
      .from('scope_comparisons')
      .insert({
        project_id: projectId,
        user_id: userId,
        baseline_scope_version_id: baselineVersion.id,
        input_text: newRequestText,
        summary_overview: comparison.result.summaryOverview,
        total_findings: comparison.result.totalFindings,
        additions_count: comparison.result.additionsCount,
        modifications_count: comparison.result.modificationsCount,
        removals_count: comparison.result.removalsCount,
        ambiguous_count: comparison.result.ambiguousCount,
        status: 'completed',
        ai_metadata: {
          model: comparison.model,
          latencyMs: comparison.latencyMs,
          usage: comparison.usage,
        },
      })
      .select()
      .single();

    if (compInsertError || !comparisonRecord) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to record comparison result' } },
        { status: 500 }
      );
    }

    // 4. Persist individual findings
    if (comparison.result.findings.length > 0) {
      const findingsToInsert = comparison.result.findings.map((f) => ({
        comparison_id: comparisonRecord.id,
        project_id: projectId,
        user_id: userId,
        finding_type: f.findingType,
        title: f.title,
        description: f.description,
        difference_explanation: f.differenceExplanation,
        evidence_quote: f.evidenceQuote,
        confidence_level: f.confidenceLevel,
        dependencies_affected: f.dependenciesAffected,
        acceptance_criteria_changes: f.acceptanceCriteriaChanges,
        suggested_clarification_questions: f.suggestedClarificationQuestions,
        suggested_action: f.suggestedAction,
        user_decision: 'pending_review' as const,
      }));

      await supabase.from('scope_comparison_findings').insert(findingsToInsert);
    }

    // 5. Record usage meters & audit log
    await supabase.from('usage_records').insert({
      user_id: userId,
      project_id: projectId,
      feature_type: 'ai_comparison',
      model_name: comparison.model,
      prompt_tokens: comparison.usage.promptTokens,
      completion_tokens: comparison.usage.completionTokens,
      total_tokens: comparison.usage.totalTokens,
      estimated_cost_usd: comparison.usage.estimatedCostUsd,
    });

    await supabase.from('audit_events').insert({
      user_id: userId,
      project_id: projectId,
      event_type: 'scope_compared',
      entity_name: 'scope_comparisons',
      entity_id: comparisonRecord.id,
      metadata: {
        total_findings: comparison.result.totalFindings,
        additions_count: comparison.result.additionsCount,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: comparisonRecord.id,
        projectId,
        ...comparison.result,
        usage: comparison.usage,
        model: comparison.model,
        latencyMs: comparison.latencyMs,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
