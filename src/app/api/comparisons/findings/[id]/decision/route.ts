import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/server';
import { RecordDecisionSchema } from '@/lib/validators/scope-comparison';
import { assertAuthenticated, isLocalDevFallbackAllowed } from '@/lib/security/guards';

interface Params {
  params: {
    id: string;
  };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: findingId } = params;
    const body = await req.json();
    const parsed = RecordDecisionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Validation failed', details: parsed.error.flatten() } },
        { status: 400 }
      );
    }

    if (isLocalDevFallbackAllowed()) {
      return NextResponse.json({
        success: true,
        data: {
          id: findingId,
          user_decision: parsed.data.decision,
          user_decision_notes: parsed.data.notes || null,
          decided_at: new Date().toISOString(),
        },
      });
    }

    const { userId } = await assertAuthenticated();
    const supabase = createServerClient();

    // Verify finding belongs to user
    const { data: finding, error: findError } = await supabase
      .from('scope_comparison_findings')
      .select('id, project_id')
      .eq('id', findingId)
      .eq('user_id', userId)
      .single();

    if (findError || !finding) {
      return NextResponse.json(
        { success: false, error: { message: 'Finding not found or access denied.' } },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();
    const { data: updated, error: updateError } = await supabase
      .from('scope_comparison_findings')
      .update({
        user_decision: parsed.data.decision,
        user_decision_notes: parsed.data.notes || null,
        decided_at: now,
      })
      .eq('id', findingId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: { message: updateError.message } }, { status: 500 });
    }

    // Record audit event
    await supabase.from('audit_events').insert({
      user_id: userId,
      project_id: finding.project_id,
      event_type: 'decision_recorded',
      entity_name: 'scope_comparison_findings',
      entity_id: findingId,
      metadata: {
        decision: parsed.data.decision,
        notes: parsed.data.notes || null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
