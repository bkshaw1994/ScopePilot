import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/server';
import { CreateRequirementSchema } from '@/lib/validators/requirement';
import { assertAuthenticated, assertProjectAccess, isLocalDevFallbackAllowed } from '@/lib/security/guards';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id: projectId } = params;

    if (isLocalDevFallbackAllowed()) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const { userId } = await assertAuthenticated();
    await assertProjectAccess(projectId, userId);
    const supabase = createServerClient();

    const { data: requirements, error } = await supabase
      .from('requirements')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: requirements });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: projectId } = params;
    const body = await req.json();
    const parsed = CreateRequirementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Validation failed', details: parsed.error.flatten() } },
        { status: 400 }
      );
    }

    if (isLocalDevFallbackAllowed()) {
      const mockReq = {
        id: crypto.randomUUID(),
        project_id: projectId,
        req_code: parsed.data.reqCode,
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        priority: parsed.data.priority,
        acceptance_criteria: parsed.data.acceptanceCriteria,
        dependencies: parsed.data.dependencies,
        assumptions: parsed.data.assumptions,
        exclusions: parsed.data.exclusions,
        unresolved_questions: parsed.data.unresolvedQuestions,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, data: mockReq }, { status: 201 });
    }

    const { userId } = await assertAuthenticated();
    await assertProjectAccess(projectId, userId);
    const supabase = createServerClient();

    const { data: created, error } = await supabase
      .from('requirements')
      .insert({
        project_id: projectId,
        user_id: userId,
        req_code: parsed.data.reqCode,
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        priority: parsed.data.priority,
        acceptance_criteria: parsed.data.acceptanceCriteria,
        dependencies: parsed.data.dependencies,
        assumptions: parsed.data.assumptions,
        exclusions: parsed.data.exclusions,
        unresolved_questions: parsed.data.unresolvedQuestions,
        source_document_id: parsed.data.sourceDocumentId || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
