import { describe, it, expect } from 'vitest';
import { generatePdfHtml, PdfExportData } from '@/lib/pdf/generator';

describe('PDF / HTML Export Generator Security & Formatting', () => {
  it('should strictly HTML-escape malicious XSS injection payloads in all fields', () => {
    const maliciousData: PdfExportData = {
      projectName: '<script>alert("xss")</script> Project',
      clientName: '<img src=x onerror="stealCredentials()">',
      currency: 'INR',
      documentType: 'scope_change_report',
      generatedAt: '2026-10-18T00:00:00Z',
      overview: '"><iframe src="evil.com"></iframe>',
      deliverables: ['<svg onload=alert(1)> Deliverable'],
      exclusions: ['<b onmouseover=alert(1)> Exclusion'],
      findings: [
        {
          title: '<script>evil()</script> Finding',
          findingType: 'new_requirement',
          matchedReqCode: 'REQ-001',
          quote: '"><script>alert("quote")</script>',
          explanation: '<style>body{display:none}</style>',
          decision: 'additional_work',
          action: '<a href="javascript:alert(1)">Click</a>',
        },
      ],
    };

    const html = generatePdfHtml(maliciousData);

    // Verify raw script and iframe tags are neutralized
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('</script>');
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<iframe');
    expect(html).not.toContain('<svg onload');
    expect(html).not.toContain('<b onmouseover');
    expect(html).not.toContain('<style>body');

    // Verify safe entity encodings
    expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(html).toContain('&lt;img src=x onerror=&quot;stealCredentials()&quot;&gt;');
    expect(html).toContain('&lt;iframe src=&quot;evil.com&quot;&gt;&lt;/iframe&gt;');
  });

  it('should correctly render document with missing optional fields', () => {
    const minimalData: PdfExportData = {
      projectName: 'Minimal App',
      clientName: 'Acme Corp',
      currency: 'USD',
      documentType: 'proposal',
      generatedAt: '2026-10-18T00:00:00Z',
    };

    const html = generatePdfHtml(minimalData);
    expect(html).toContain('Minimal App');
    expect(html).toContain('Acme Corp');
    expect(html).toContain('USD');
    expect(html).toContain('v1.0 (Locked)');
  });
});
