'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  History,
  ArrowLeft,
  ShieldCheck,
  Lock,
  PlusCircle,
  FileCheck2,
  GitCompare,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ProjectHistoryPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  const auditEvents = [
    {
      id: 'evt-05',
      eventType: 'Human Decision Recorded',
      description: 'Marked "Apple Watch Bluetooth Hardware Sync" as Additional Work (Change Order #02)',
      actor: 'Aarav Sharma (Lead Architect)',
      timestamp: new Date().toISOString(),
      icon: CheckCircle2,
      color: 'text-brand-600 bg-brand-50',
    },
    {
      id: 'evt-04',
      eventType: 'Scope Comparison Run #04',
      description: 'Evaluated client email text against active baseline v1.0. Identified 1 addition, 1 modification, 1 clarification.',
      actor: 'AI Scope Engine (Gemini 1.5 Flash)',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      icon: GitCompare,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      id: 'evt-03',
      eventType: 'Scope Baseline Approved & Locked',
      description: 'Frozen v1.0 baseline containing 4 active requirements. Generated SHA-256 integrity hash: sha256:a8b79e0...',
      actor: 'Aarav Sharma (Lead Architect)',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      icon: Lock,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'evt-02',
      eventType: 'Proposal Draft Generated',
      description: 'Created v1.0 Proposal with 3 milestones, explicit hardware exclusions, and 120-150 estimated hours.',
      actor: 'ScopePilot AI Assistant',
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
      icon: FileText,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      id: 'evt-01',
      eventType: 'Project Created',
      description: 'Initialized project container for FitTrack Pro SaaS (Client: Apex Health Ltd, Currency: INR).',
      actor: 'Aarav Sharma',
      timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
      icon: PlusCircle,
      color: 'text-surface-600 bg-surface-100',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
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
      <div className="pb-6 border-b border-surface-200">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-surface-950 tracking-tight">
            Activity & Audit History
          </h1>
          <Badge variant="success">Immutable Audit Active</Badge>
        </div>
        <p className="text-xs text-surface-500 mt-1">
          Chronological, append-only log of requirements, baseline freezes, comparisons, and human decisions.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-surface-200">
        {auditEvents.map((evt) => {
          const Icon = evt.icon;
          return (
            <div key={evt.id} className="relative flex items-start gap-4">
              {/* Dot Icon */}
              <div
                className={`absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center border border-white shadow-sm ${evt.color}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              {/* Event Card */}
              <Card className="flex-1 p-5 bg-white border-surface-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h3 className="font-bold text-sm text-surface-950">{evt.eventType}</h3>
                  <span className="text-[11px] text-surface-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(evt.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-surface-600 leading-relaxed mb-2">
                  {evt.description}
                </p>
                <div className="text-[11px] text-surface-500 font-medium">
                  Actor: <span className="text-surface-800">{evt.actor}</span>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
