import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/server';
import { CreateProjectSchema } from '@/lib/validators/project';
import { assertAuthenticated } from '@/lib/security/guards';

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Check if real Supabase keys are configured
    if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Using local storage mode.',
      });
    }

    const { userId } = await assertAuthenticated();
    const supabase = createServerClient();

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: projects });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: { message } },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation failed',
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
      const mockProject = {
        id: crypto.randomUUID(),
        user_id: 'mock-user-id',
        name: parsed.data.name,
        description: parsed.data.description || null,
        client_name: parsed.data.clientName,
        client_email: parsed.data.clientEmail || null,
        currency: parsed.data.currency,
        status: 'draft',
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, data: mockProject }, { status: 201 });
    }

    const { userId } = await assertAuthenticated();
    const supabase = createServerClient();

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name: parsed.data.name,
        description: parsed.data.description || null,
        client_name: parsed.data.clientName,
        client_email: parsed.data.clientEmail || null,
        currency: parsed.data.currency,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: { message } },
      { status: 500 }
    );
  }
}
