import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/server';
import { assertAuthenticated, assertProjectAccess, isLocalDevFallbackAllowed } from '@/lib/security/guards';
import { computeSha256Hash } from '@/lib/domain/hash';
import { z } from 'zod';

interface Params {
  params: {
    id: string;
  };
}

const ApproveBaselineSchema = z.object({
  versionLabel: z.string().trim().min(1, 'Version label is required').max(100),
  approverName: z.string().trim().min(1, 'Approver name is required').max(100),
  approvalNotes: z.string().trim().max(1000).optional(),
});

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

    const { data: versions, error } = await supabase
      .from('scope_versions')
      .select('*, scope_approvals(*)')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: versions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: projectId } = params;
    const body = await req.json();
    const parsed = ApproveBaselineSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Validation failed', details: parsed.error.flatten() } },
        { status: 400 }
      );
    }

    if (isLocalDevFallbackAllowed()) {
      const mockSnapshot = [
        { req_code: 'REQ-001', title: 'User Authentication' },
        { req_code: 'REQ-002', title: 'Dashboard Tracking' },
      ];
      const mockHash = computeSha256Hash(mockSnapshot);
      const mockVersion = {
        id: crypto.randomUUID(),
        project_id: projectId,
        version_number: 1,
        version_label: parsed.data.versionLabel,
        is_baseline: true,
        content_hash: mockHash,
        requirements_snapshot: mockSnapshot,
        created_at: new Date().toISOString(),
        approvals: [
          {
            approver_name: parsed.data.approverName,
            approval_notes: parsed.data.approvalNotes || null,
            approved_at: new Date().toISOString(),
          },
        ],
      };
      return NextResponse.json({ success: true, data: mockVersion }, { status: 201 });
    }

    const { userId } = await assertAuthenticated();
    await assertProjectAccess(projectId, userId);
    const supabase = createServerClient();

    // 1. Fetch all current active requirements
    const { data: requirements, error: reqError } = await supabase
      .from('requirements')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('req_code', { ascending: true });

    if (reqError || !requirements || requirements.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: 'Cannot establish baseline: Project has no active requirements.' } },
        { status: 400 }
      );
    }

    // 2. Compute canonical cryptographic SHA-256 hash of requirement set
    const contentHash = computeSha256Hash(requirements);

    // 3. Determine next version number
    const { data: existingVersions } = await supabase
      .from('scope_versions')
      .select('version_number')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersionNumber = existingVersions && existingVersions.length > 0
      ? existingVersions[0].version_number + 1
      : 1;

    // 4. Mark prior baselines as is_baseline = false (or archive them)
    if (nextVersionNumber > 1) {
      await supabase
        .from('scope_versions')
        .update({ is_baseline: false })
        .eq('project_id', projectId);
    }

    // 5. Insert immutable scope version
    const { data: newVersion, error: versionError } = await supabase
      .from('scope_versions')
      .insert({
        project_id: projectId,
        user_id: userId,
        version_number: nextVersionNumber,
        version_label: parsed.data.versionLabel,
        is_baseline: true,
        content_hash: contentHash,
        requirements_snapshot: requirements,
      })
      .select()
      .single();

    if (versionError || !newVersion) {
      return NextResponse.json(
        { success: false, error: { message: versionError?.message || 'Failed to create scope version' } },
        { status: 500 }
      );
    }

    // 6. Record formal approval
    await supabase.from('scope_approvals').insert({
      scope_version_id: newVersion.id,
      project_id: projectId,
      user_id: userId,
      approver_name: parsed.data.approverName,
      approval_notes: parsed.data.approvalNotes || null,
      content_hash_verified: true,
    });

    // 7. Update project status to active
    await supabase
      .from('projects')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', projectId);

    // 8. Record audit log
    await supabase.from('audit_events').insert({
      user_id: userId,
      project_id: projectId,
      event_type: 'scope_baseline_approved',
      entity_name: 'scope_versions',
      entity_id: newVersion.id,
      metadata: {
        version_number: nextVersionNumber,
        version_label: parsed.data.versionLabel,
        content_hash: contentHash,
        requirements_count: requirements.length,
      },
    });

    return NextResponse.json({ success: true, data: newVersion }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
