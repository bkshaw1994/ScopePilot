'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge, BaselineLockedBadge } from '@/components/ui/badge';
import {
  FolderKanban,
  FileText,
  FileCheck2,
  GitCompare,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Building,
  Coins,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ProjectHubPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  const [project, setProject] = useState<{
    id: string;
    name: string;
    clientName: string;
    currency: string;
    status: 'draft' | 'active' | 'completed' | 'archived';
    description?: string;
    baselineVersion?: string;
    contentHash?: string;
    createdAt: string;
    requirementsCount: number;
  }>({
    id: projectId,
    name: 'FitTrack Pro SaaS Redesign',
    clientName: 'Apex Health Ltd',
    currency: 'INR',
    status: 'active',
    description: 'Personal fitness and macro tracking dashboard with Stripe subscriptions and mobile sync.',
    baselineVersion: 'v1.0 (Signed Agreement)',
    contentHash: 'a8b79e0689f3a51ad3e24a9f2ce5e8f498c17b',
    createdAt: new Date().toISOString(),
    requirementsCount: 6,
  });

  useEffect(() => {
    // Check if project exists in local storage
    const saved = localStorage.getItem('scopepilot_projects');
    if (saved) {
      try {
        const list = JSON.parse(saved);
        const found = list.find((p: { id: string }) => p.id === projectId);
        if (found) {
          setProject((prev) => ({ ...prev, ...found }));
        }
      } catch {
        // Fallback to default state
      }
    }
  }, [projectId]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back to Projects */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-surface-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Project Overview Card */}
      <div className="rounded-2xl border border-surface-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-surface-100">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-950 tracking-tight">
                {project.name}
              </h1>
              <Badge variant={project.status === 'active' ? 'success' : 'warning'}>
                {project.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-surface-500 flex items-center gap-2">
              <Building className="w-4 h-4 text-surface-400" />
              <span>Client: {project.clientName}</span>
              <span>•</span>
              <Coins className="w-4 h-4 text-surface-400" />
              <span>Currency: {project.currency}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {project.baselineVersion ? (
              <BaselineLockedBadge versionLabel={project.baselineVersion} />
            ) : (
              <Badge variant="warning">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Baseline Not Yet Approved</span>
              </Badge>
            )}
          </div>
        </div>

        {project.description && (
          <p className="mt-4 text-xs text-surface-600 leading-relaxed max-w-3xl">
            {project.description}
          </p>
        )}

        {/* Cryptographic Hash Snapshot Proof */}
        {project.contentHash && (
          <div className="mt-4 p-3 rounded-xl bg-surface-50 border border-surface-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-surface-600">
                <strong>Cryptographic Integrity Hash:</strong>{' '}
                <span className="font-mono text-[11px] text-surface-800">
                  sha256:{project.contentHash.slice(0, 32)}...
                </span>
              </span>
            </div>
            <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Database Immutability Active
            </span>
          </div>
        )}
      </div>

      {/* 4 Core Module Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Requirements Intake */}
        <Card className="p-6 bg-white hover:border-brand-300 transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-surface-950 mb-1">
              Requirements Intake & Editor
            </h3>
            <p className="text-xs text-surface-600 leading-relaxed mb-4">
              Define, categorize, and refine project requirements. Specify explicit exclusions, acceptance criteria, assumptions, and dependencies.
            </p>
            <div className="text-xs font-semibold text-surface-700 bg-surface-50 p-2.5 rounded-lg border border-surface-100 mb-4">
              {project.requirementsCount} structured requirements defined
            </div>
          </div>
          <Link href={`/projects/${projectId}/requirements`}>
            <Button variant="outline" size="sm" className="w-full justify-between">
              <span>Edit Requirements</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>

        {/* Module 2: Proposal Draft */}
        <Card className="p-6 bg-white hover:border-brand-300 transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-surface-950 mb-1">
              Proposal Generator & Preview
            </h3>
            <p className="text-xs text-surface-600 leading-relaxed mb-4">
              Generate a client-ready proposal with executive overview, deliverables, milestone schedules, explicit exclusions, and risk matrices.
            </p>
            <div className="text-xs font-semibold text-surface-700 bg-surface-50 p-2.5 rounded-lg border border-surface-100 mb-4">
              Proposal Draft v1.0 • Ready for Review
            </div>
          </div>
          <Link href={`/projects/${projectId}/proposal`}>
            <Button variant="outline" size="sm" className="w-full justify-between">
              <span>View & Edit Proposal</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>

        {/* Module 3: Baseline Approval */}
        <Card className="p-6 bg-white hover:border-brand-300 transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-surface-950 mb-1">
              Scope Baseline & Versioning
            </h3>
            <p className="text-xs text-surface-600 leading-relaxed mb-4">
              Freeze the approved scope into an immutable baseline. PostgreSQL triggers prevent silent overwriting. Inspect version history and audit hashes.
            </p>
            <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 mb-4 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Baseline Locked: {project.baselineVersion || 'None'}</span>
            </div>
          </div>
          <Link href={`/projects/${projectId}/baseline`}>
            <Button variant="outline" size="sm" className="w-full justify-between">
              <span>Manage Baseline Versions</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>

        {/* Module 4: Scope Creep Engine (The Differentiator) */}
        <Card className="p-6 bg-gradient-to-br from-brand-50/50 via-white to-purple-50/30 border-brand-200 hover:border-brand-400 shadow-sm transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-4 shadow-sm shadow-brand-500/30">
              <GitCompare className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-surface-950">
                Scope Creep Detection Engine
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                CORE
              </span>
            </div>
            <p className="text-xs text-surface-600 leading-relaxed mb-4">
              Paste a client message or upload a new change request. The AI compares it against the locked baseline, classifies creep, and drafts change orders.
            </p>
            <div className="text-xs font-semibold text-brand-900 bg-brand-50 p-2.5 rounded-lg border border-brand-200 mb-4">
              5-Category AI Analysis • Human Decision Log
            </div>
          </div>
          <Link href={`/projects/${projectId}/compare`}>
            <Button variant="primary" size="sm" className="w-full justify-between shadow-sm shadow-brand-500/25">
              <span>Run Scope Comparison</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
