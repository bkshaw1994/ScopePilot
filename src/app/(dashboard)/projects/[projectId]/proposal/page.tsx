'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  ArrowLeft,
  FileCheck2,
  Download,
  AlertTriangle,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function ProposalPreviewPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');

  // Proposal content state
  const [proposal, setProposal] = useState({
    title: 'FitTrack Pro SaaS - Technical Scope Proposal',
    versionNumber: 1,
    overview:
      'FitTrack Pro is a web application designed to allow users to log daily calorie consumption, track macro distributions (protein, carbs, fat), and subscribe to premium meal recommendations via Stripe.',
    objectives: [
      'Deliver a responsive, sub-second web application for fitness enthusiasts.',
      'Implement secure user authentication and session management.',
      'Enable recurring credit card billing with automated customer portal management.',
    ],
    deliverables: [
      'Email & password authentication with email verification flow (REQ-001)',
      'Daily calorie & macro tracking dashboard with interactive charts (REQ-002)',
      'Stripe subscription checkout with automated webhook billing sync (REQ-003)',
      'REST API sync endpoint for mobile app workout reading (REQ-004)',
    ],
    exclusions: [
      'Hardware Bluetooth sync with Apple Watch, Garmin, or Fitbit (REQ-EXCL-01)',
      'Multilingual localization and non-English translations',
      'Native iOS / Android store packaging (PWA web application only)',
      'Manual bank transfer and offline invoicing processing',
    ],
    milestones: [
      { name: 'Milestone 1: Authentication & Core Dashboard', duration: '2 Weeks' },
      { name: 'Milestone 2: Stripe Billing & Macro Analytics', duration: '2 Weeks' },
      { name: 'Milestone 3: REST API Sync & QA Verification', duration: '1 Week' },
    ],
    estimatedHoursMin: 120,
    estimatedHoursMax: 150,
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-surface-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Project Hub</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-surface-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-surface-950 tracking-tight">
              Project Proposal & Scope Document
            </h1>
            <Badge variant="outline">Draft v1.0</Badge>
          </div>
          <p className="text-xs text-surface-500 mt-1">
            Review the formal client agreement draft before approving the immutable scope baseline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/projects/${projectId}/baseline`}>
            <Button variant="primary" size="sm" leftIcon={<FileCheck2 className="w-4 h-4" />}>
              Approve Baseline
            </Button>
          </Link>
        </div>
      </div>

      {/* Disclaimer Alert */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          <strong>Legal & Technical Notice:</strong> AI-generated effort estimates and proposal summaries are advisory drafts. Review all deliverables, milestones, and exclusions before sharing with the client or approving your contractual baseline.
        </p>
      </div>

      {/* Proposal Document Preview */}
      <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-sm space-y-8">
        {/* Document Header */}
        <div className="border-b border-surface-200 pb-6">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
            SCOPE AGREEMENT PROPOSAL
          </span>
          <h2 className="text-2xl font-bold text-surface-950 mt-1">{proposal.title}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-6 text-xs text-surface-500">
            <span>Prepared: {new Date().toLocaleDateString()}</span>
            <span>Version: v{proposal.versionNumber}.0 (Draft)</span>
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Pre-Baseline Review
            </span>
          </div>
        </div>

        {/* Section 1: Executive Overview */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-surface-950 uppercase tracking-wider">
            1. Executive Overview
          </h3>
          <p className="text-xs text-surface-700 leading-relaxed">{proposal.overview}</p>
        </div>

        {/* Section 2: Core Objectives */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-surface-950 uppercase tracking-wider">
            2. Primary Project Objectives
          </h3>
          <ul className="space-y-1.5 text-xs text-surface-700 pl-5 list-disc">
            {proposal.objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </div>

        {/* Section 3: Deliverables */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-surface-950 uppercase tracking-wider">
            3. Agreed Functional Deliverables
          </h3>
          <ul className="space-y-1.5 text-xs text-surface-700 pl-5 list-disc">
            {proposal.deliverables.map((del, i) => (
              <li key={i} className="font-medium text-surface-900">
                {del}
              </li>
            ))}
          </ul>
        </div>

        {/* Section 4: Explicit Exclusions */}
        <div className="space-y-2 p-5 rounded-xl bg-amber-50/60 border border-amber-200">
          <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
            <span>4. Explicit Exclusions (Out of Scope)</span>
          </h3>
          <p className="text-xs text-amber-800 mb-2">
            The following items are explicitly excluded from the v1.0 scope and will require a formal change order if requested:
          </p>
          <ul className="space-y-1 text-xs text-amber-950 pl-5 list-disc">
            {proposal.exclusions.map((ex, i) => (
              <li key={i}>{ex}</li>
            ))}
          </ul>
        </div>

        {/* Section 5: Milestones & Effort */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-surface-950 uppercase tracking-wider">
            5. Suggested Delivery Milestones
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {proposal.milestones.map((m, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-surface-200 bg-surface-50">
                <span className="text-[11px] font-bold text-brand-600 uppercase">
                  Stage {idx + 1}
                </span>
                <h4 className="font-semibold text-xs text-surface-950 mt-1">{m.name}</h4>
                <p className="text-[11px] text-surface-500 mt-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Estimated: {m.duration}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between text-xs text-surface-700">
            <span>Estimated Total Effort:</span>
            <span className="font-mono font-bold text-surface-950">
              {proposal.estimatedHoursMin} - {proposal.estimatedHoursMax} Engineering Hours
            </span>
          </div>
        </div>

        {/* CTA to baseline */}
        <div className="pt-6 border-t border-surface-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-surface-500">
            Satisfied with the proposal terms? Freeze this version into an immutable baseline.
          </span>
          <Link href={`/projects/${projectId}/baseline`}>
            <Button variant="primary" size="md" leftIcon={<FileCheck2 className="w-4 h-4" />}>
              Lock Scope Baseline Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
