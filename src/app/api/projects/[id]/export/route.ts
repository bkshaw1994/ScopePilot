import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/server';
import { generatePdfHtml, PdfExportData } from '@/lib/pdf/generator';
import { assertAuthenticated, assertProjectAccess, isLocalDevFallbackAllowed } from '@/lib/security/guards';

interface Params {
  params: {
    id: string;
  };
}

const VALID_DOC_TYPES = ['proposal', 'baseline', 'scope_change_report'] as const;
type ValidDocType = typeof VALID_DOC_TYPES[number];

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id: projectId } = params;
    const url = new URL(req.url);
    const rawType = url.searchParams.get('type');
    const docType: ValidDocType = (VALID_DOC_TYPES as readonly string[]).includes(rawType || '')
      ? (rawType as ValidDocType)
      : 'scope_change_report';

    const safeFilename = `scopepilot-${projectId.replace(/[^a-zA-Z0-9_-]/g, '')}-${docType}.html`;

    if (isLocalDevFallbackAllowed()) {
      // Local development fallback
      const reportData: PdfExportData = {
        projectName: 'FitTrack Pro SaaS',
        clientName: 'Apex Health Ltd',
        currency: 'INR',
        versionLabel: 'v1.0 (Signed Initial Agreement)',
        contentHash: 'a8b79e0689f3a51ad3e24a9f2ce5e8f498c17b8f9e0123456789abcdef0123',
        documentType: docType,
        generatedAt: new Date().toUTCString(),
        overview: 'Comprehensive scope agreement and change-order audit document.',
        deliverables: [
          'REQ-001: Email & password authentication with email verification flow',
          'REQ-002: Daily calorie & macro tracking dashboard with interactive charts',
          'REQ-003: Stripe subscription recurring billing integration (₹1,499/mo)',
        ],
        exclusions: [
          'REQ-EXCL-01: Direct hardware Bluetooth communication with Apple Watch or Garmin',
          'Multilingual localization and non-English translations',
        ],
        findings: [
          {
            title: 'Apple Watch Bluetooth Hardware Sync',
            findingType: 'new_requirement',
            matchedReqCode: 'REQ-EXCL-01',
            quote: 'We want users to connect their Apple Watch directly via Bluetooth to sync heart rate during workouts.',
            explanation: 'Hardware Bluetooth sync was explicitly excluded in approved baseline REQ-EXCL-01.',
            decision: 'additional_work',
            action: 'Requires Change Order #02 • Estimated +35 Hours',
          },
        ],
      };

      const htmlContent = generatePdfHtml(reportData);
      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="${safeFilename}"`,
          'Cache-Control': 'no-store, private',
        },
      });
    }

    // Authenticated Production Flow
    const { userId } = await assertAuthenticated();
    const project = await assertProjectAccess(projectId, userId);
    const supabase = createServerClient();

    // 1. Fetch active baseline version
    const { data: baseline } = await supabase
      .from('scope_versions')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_baseline', true)
      .single();

    // 2. Fetch requirements
    const { data: requirements } = await supabase
      .from('requirements')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true);

    const deliverables = (requirements || [])
      .filter((r: { category: string }) => r.category !== 'exclusion')
      .map((r: { req_code: string; title: string }) => `${r.req_code}: ${r.title}`);

    const exclusions = (requirements || [])
      .filter((r: { category: string }) => r.category === 'exclusion')
      .map((r: { req_code: string; title: string }) => `${r.req_code}: ${r.title}`);

    // 3. Fetch recent comparison findings
    const { data: comparisons } = await supabase
      .from('scope_comparisons')
      .select('id')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1);

    let findingsList: PdfExportData['findings'] = [];
    if (comparisons && comparisons.length > 0) {
      const { data: dbFindings } = await supabase
        .from('scope_comparison_findings')
        .select('*')
        .eq('comparison_id', comparisons[0].id);

      if (dbFindings) {
        findingsList = dbFindings.map((f: {
          title: string;
          finding_type: string;
          requirement_id: string | null;
          evidence_quote: string;
          difference_explanation: string;
          user_decision: string;
          suggested_action: string | null;
        }) => ({
          title: f.title,
          findingType: f.finding_type,
          matchedReqCode: f.requirement_id,
          quote: f.evidence_quote,
          explanation: f.difference_explanation,
          decision: f.user_decision,
          action: f.suggested_action || 'Review required',
        }));
      }
    }

    const reportData: PdfExportData = {
      projectName: project.name,
      clientName: project.client_name,
      currency: project.currency,
      versionLabel: baseline?.version_label || 'v1.0 Baseline',
      contentHash: baseline?.content_hash || undefined,
      documentType: docType,
      generatedAt: new Date().toUTCString(),
      overview: project.description || undefined,
      deliverables,
      exclusions,
      findings: findingsList,
    };

    const htmlContent = generatePdfHtml(reportData);

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${safeFilename}"`,
        'Cache-Control': 'no-store, private',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: { message } }, { status: 403 });
  }
}
