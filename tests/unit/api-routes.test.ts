import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as healthGet } from '@/app/api/health/route';
import { POST as extractPost } from '@/app/api/ai/extract/route';
import { PATCH as decisionPatch } from '@/app/api/comparisons/findings/[id]/decision/route';

describe('API Route Handlers Unit Tests', () => {
  it('GET /api/health returns 200 with healthy status and system metrics', async () => {
    const res = await healthGet();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('healthy');
    expect(body.version).toBe('1.0.0');
    expect(body.system).toBeDefined();
    expect(body.system.heapUsedMb).toBeGreaterThan(0);
  });

  it('POST /api/ai/extract validates request payload and rejects short text', async () => {
    const req = new NextRequest('http://localhost:3000/api/ai/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: 'proj-123',
        rawText: 'short', // less than 10 chars
      }),
    });

    const res = await extractPost(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.message).toBe('Validation failed');
  });

  it('POST /api/ai/extract returns structured requirements in fallback/dev mode', async () => {
    const req = new NextRequest('http://localhost:3000/api/ai/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: 'proj-123',
        rawText: 'Client needs authentication with password policy, and an interactive tracking dashboard.',
      }),
    });

    const res = await extractPost(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.projectId).toBe('proj-123');
    expect(body.data.requirements.length).toBeGreaterThan(0);
    expect(body.data.requirements[0].reqCode).toBe('REQ-001');
  });

  it('PATCH /api/comparisons/findings/[id]/decision rejects invalid decision value', async () => {
    const req = new NextRequest('http://localhost:3000/api/comparisons/findings/find-1/decision', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decision: 'invalid_decision_type',
      }),
    });

    const res = await decisionPatch(req, { params: { id: 'find-1' } });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.message).toBe('Validation failed');
  });

  it('PATCH /api/comparisons/findings/[id]/decision records valid decision', async () => {
    const req = new NextRequest('http://localhost:3000/api/comparisons/findings/find-1/decision', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decision: 'additional_work',
        notes: 'Client agreed to 35 hours change order quote',
      }),
    });

    const res = await decisionPatch(req, { params: { id: 'find-1' } });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.user_decision).toBe('additional_work');
  });
});
