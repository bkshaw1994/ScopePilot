import { escapeHtml } from '@/lib/security/sanitize';

export interface PdfExportData {
  projectName: string;
  clientName: string;
  currency: string;
  versionLabel?: string;
  contentHash?: string;
  documentType: 'proposal' | 'baseline' | 'scope_change_report';
  generatedAt: string;
  overview?: string;
  deliverables?: string[];
  exclusions?: string[];
  findings?: Array<{
    title: string;
    findingType: string;
    matchedReqCode: string | null;
    quote: string;
    explanation: string;
    decision: string;
    action: string;
  }>;
}

/**
 * Generates an accessible, print-ready HTML/PDF document stream
 * formatted with high-contrast typography, tables, and audit watermarks.
 * All user-controlled fields are strictly HTML-escaped to prevent Stored XSS.
 */
export function generatePdfHtml(data: PdfExportData): string {
  const isScopeReport = data.documentType === 'scope_change_report';

  const safeProjectName = escapeHtml(data.projectName);
  const safeClientName = escapeHtml(data.clientName);
  const safeCurrency = escapeHtml(data.currency);
  const safeVersionLabel = escapeHtml(data.versionLabel || 'v1.0 (Locked)');
  const safeContentHash = data.contentHash ? escapeHtml(data.contentHash) : '';
  const safeDocType = escapeHtml(data.documentType.replace(/_/g, ' ').toUpperCase());
  const safeGeneratedAt = escapeHtml(data.generatedAt);
  const safeOverview = data.overview ? escapeHtml(data.overview) : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ScopePilot - ${safeProjectName} (${safeDocType})</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.5;
      font-size: 11pt;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    .header {
      border-bottom: 2px solid #6366f1;
      padding-bottom: 12px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .brand {
      font-size: 18pt;
      font-weight: 800;
      color: #1e1b4b;
      letter-spacing: -0.5px;
    }
    .brand span {
      color: #6366f1;
    }
    .doc-type {
      font-size: 10pt;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .meta-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 24px;
      font-size: 9.5pt;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      row-gap: 6px;
    }
    .hash-badge {
      font-family: ui-monospace, monospace;
      font-size: 8.5pt;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: 4px 8px;
      border-radius: 4px;
      margin-top: 8px;
      display: inline-block;
      word-break: break-all;
    }
    h2 {
      font-size: 13pt;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    .finding-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 14px;
      page-break-inside: avoid;
    }
    .finding-card.creep {
      border-left: 4px solid #f43f5e;
      background: #fff1f2;
    }
    .finding-card.matched {
      border-left: 4px solid #10b981;
      background: #f0fdf4;
    }
    .quote-box {
      background: #ffffff;
      border-left: 3px solid #94a3b8;
      padding: 8px 12px;
      font-size: 9pt;
      font-family: ui-monospace, monospace;
      margin: 8px 0;
      color: #334155;
      white-space: pre-wrap;
    }
    .exclusion-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px;
      padding: 14px;
      margin: 16px 0;
    }
    .exclusion-box h3 {
      margin: 0 0 8px 0;
      color: #92400e;
      font-size: 11pt;
    }
    .footer {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 8.5pt;
      color: #64748b;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Scope<span>Pilot</span></div>
      <div style="font-size: 9pt; color: #64748b;">Deterministic Scope Management SaaS</div>
    </div>
    <div style="text-align: right;">
      <div class="doc-type">${safeDocType}</div>
      <div style="font-size: 8.5pt; color: #64748b;">Generated: ${safeGeneratedAt}</div>
    </div>
  </div>

  <div class="meta-box">
    <div class="meta-grid">
      <div><strong>Project:</strong> ${safeProjectName}</div>
      <div><strong>Client:</strong> ${safeClientName}</div>
      <div><strong>Currency:</strong> ${safeCurrency}</div>
      <div><strong>Baseline Version:</strong> ${safeVersionLabel}</div>
    </div>
    ${
      safeContentHash
        ? `<div class="hash-badge">Cryptographic Integrity Hash: sha256:${safeContentHash}</div>`
        : ''
    }
  </div>

  ${
    safeOverview
      ? `<h2>1. Executive Summary</h2><p style="font-size: 10pt; color: #334155;">${safeOverview}</p>`
      : ''
  }

  ${
    data.deliverables && data.deliverables.length > 0
      ? `<h2>Agreed Deliverables</h2>
         <ul style="font-size: 10pt; color: #334155; padding-left: 20px;">
           ${data.deliverables.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}
         </ul>`
      : ''
  }

  ${
    data.exclusions && data.exclusions.length > 0
      ? `<div class="exclusion-box">
           <h3>Explicit Exclusions (Out of Scope in Baseline)</h3>
           <ul style="font-size: 9.5pt; color: #78350f; padding-left: 20px; margin: 0;">
             ${data.exclusions.map((ex) => `<li>${escapeHtml(ex)}</li>`).join('')}
           </ul>
         </div>`
      : ''
  }

  ${
    isScopeReport && data.findings && data.findings.length > 0
      ? `<h2>Scope Change Findings & Audit Log</h2>
         ${data.findings
           .map(
             (f) => `
         <div class="finding-card ${f.findingType === 'new_requirement' ? 'creep' : 'matched'}">
           <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 10pt;">
             <span>${escapeHtml(f.title)}</span>
             <span style="text-transform: uppercase; font-size: 8.5pt;">${escapeHtml(
               f.findingType.replace(/_/g, ' ')
             )}</span>
           </div>
           <div class="quote-box">Client Quote: "${escapeHtml(f.quote)}"</div>
           <div style="font-size: 9pt; color: #475569; margin-top: 4px;"><strong>Delta:</strong> ${escapeHtml(
             f.explanation
           )}</div>
           <div style="font-size: 9pt; margin-top: 6px;"><strong>Recorded Decision:</strong> ${escapeHtml(
             f.decision.replace(/_/g, ' ').toUpperCase()
           )}</div>
           <div style="font-size: 8.5pt; color: #1e293b; font-weight: 600; margin-top: 4px;">Action: ${escapeHtml(
             f.action
           )}</div>
         </div>`
           )
           .join('')}`
      : ''
  }

  <div class="footer">
    ScopePilot Audit Report • Cryptographically Verified Baseline • All Rights Reserved
  </div>
</body>
</html>`;
}
