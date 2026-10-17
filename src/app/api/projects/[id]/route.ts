import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/server';
import { UpdateProjectSchema } from '@/lib/validators/project';
import { assertAuthenticated, assertProjectAccess, isLocalDevFallbackAllowed } from '@/lib/security/guards';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    if (isLocalDevFallbackAllowed()) {
      return NextResponse.json({
        success: true,
        data: {
          id,
          name: 'FitTrack Pro SaaS',
          client_name: 'Apex Health Ltd',
          currency: 'INR',
          status: 'active',
          is_archived: false,
          created_at: new Date().toISOString(),
        },
      });
    }

    const { userId } = await assertAuthenticated();
    const project = await assertProjectAccess(id, userId);

    return NextResponse.json({ success: true, data: project });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: { message } },
      { status: 404 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const body = await req.json();
    const parsed = UpdateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Validation failed', details: parsed.error.flatten() } },
        { status: 400 }
      );
    }

    if (isLocalDevFallbackAllowed()) {
      return NextResponse.json({ success: true, data: { id, ...parsed.data } });
    }

    const { userId } = await assertAuthenticated();
    await assertProjectAccess(id, userId);
    const supabase = createServerClient();

    const updatePayload: Record<string, unknown> = {};
    if (parsed.data.name) updatePayload.name = parsed.data.name;
    if (parsed.data.description !== undefined) updatePayload.description = parsed.data.description;
    if (parsed.data.clientName) updatePayload.client_name = parsed.data.clientName;
    if (parsed.data.clientEmail !== undefined) updatePayload.client_email = parsed.data.clientEmail;
    if (parsed.data.currency) updatePayload.currency = parsed.data.currency;
    if (parsed.data.status) updatePayload.status = parsed.data.status;
    if (parsed.data.isArchived !== undefined) {
      updatePayload.is_archived = parsed.data.isArchived;
      updatePayload.archived_at = parsed.data.isArchived ? new Date().toISOString() : null;
    }
    updatePayload.updated_at = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from('projects')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
