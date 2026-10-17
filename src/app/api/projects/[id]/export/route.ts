import { NextRequest, NextResponse } from 'next/server';
import { generatePdfHtml, PdfExportData } from '@/lib/pdf/generator';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id: projectId } = params;
    const url = new URL(req.url);
    const type = (url.searchParams.get('type') as PdfExportData['documentType']) || 'scope_change_report';

    // Build report payload
    const reportData: PdfExportData = {
      projectName: 'FitTrack Pro SaaS',
      clientName: 'Apex Health Ltd',
      currency: 'INR',
      versionLabel: 'v1.0 (Signed Initial Agreement)',
      contentHash: 'a8b79e0689f3a51ad3e24a9f2ce5e8f498c17b8f9e0123456789abcdef0123',
      documentType: type,
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
        {
          title: 'Macro Chart Slices Green for Protein',
          findingType: 'matched_requirement',
          matchedReqCode: 'REQ-002',
          quote: 'For the macro dashboard, just to clarify, we want the pie chart slices to use green for protein and blue for carbs.',
          explanation: 'Color preference is covered under approved REQ-002 deliverable.',
          decision: 'included_in_scope',
          action: 'Included in scope • Zero additional fee',
        },
      ],
    };

    const htmlContent = generatePdfHtml(reportData);

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="scopepilot-${projectId}-${type}.html"`,
        'Cache-Control': 'no-store, private',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
