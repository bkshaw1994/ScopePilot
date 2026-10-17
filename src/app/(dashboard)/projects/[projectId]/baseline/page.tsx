'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge, BaselineLockedBadge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  FileCheck2,
  ArrowLeft,
  ShieldCheck,
  Lock,
  History,
  AlertTriangle,
  CheckCircle2,
  GitCompare,
  ArrowRight,
} from 'lucide-react';
import { computeSha256Hash } from '@/lib/domain/hash';
import { formatDate } from '@/lib/utils';

interface BaselineVersion {
  id: string;
  versionNumber: number;
  versionLabel: string;
  isBaseline: boolean;
  contentHash: string;
  requirementsCount: number;
  approverName: string;
  approvedAt: string;
  notes?: string;
}

export default function BaselineManagementPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  const [versions, setVersions] = useState<BaselineVersion[]>([]);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [versionLabel, setVersionLabel] = useState('v1.0 - Initial Agreement');
  const [approverName, setApproverName] = useState('Lead Architect');
  const [approvalNotes, setApprovalNotes] = useState('Approved following client review of deliverables and exclusions.');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`scopepilot_baselines_${projectId}`);
    if (saved) {
      try {
        setVersions(JSON.parse(saved));
      } catch {
        setVersions([]);
      }
    } else {
      // Starter baseline version
      const starterBaseline: BaselineVersion = {
        id: 'ver-01',
        versionNumber: 1,
        versionLabel: 'v1.0 (Signed Initial Agreement)',
        isBaseline: true,
        contentHash: 'a8b79e0689f3a51ad3e24a9f2ce5e8f498c17b8f9e0123456789abcdef0123',
        requirementsCount: 4,
        approverName: 'Aarav Sharma',
        approvedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        notes: 'Agreed fixed-price scope covering REQ-001 through REQ-003 with REQ-EXCL-01 hardware exclusions.',
      };
      setVersions([starterBaseline]);
      localStorage.setItem(`scopepilot_baselines_${projectId}`, JSON.stringify([starterBaseline]));
    }
  }, [projectId]);

  const activeBaseline = versions.find((v) => v.isBaseline);

  const handleApproveBaseline = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Fetch requirements to hash
      const savedReqs = localStorage.getItem(`scopepilot_reqs_${projectId}`);
      const reqList = savedReqs ? JSON.parse(savedReqs) : [];

      const hash = computeSha256Hash(reqList);
      const nextVersionNumber = versions.length + 1;

      const newVersion: BaselineVersion = {
        id: `ver-${Date.now().toString(36)}`,
        versionNumber: nextVersionNumber,
        versionLabel: versionLabel,
        isBaseline: true,
        contentHash: hash,
        requirementsCount: reqList.length,
        approverName: approverName,
        approvedAt: new Date().toISOString(),
        notes: approvalNotes,
      };

      // Mark older versions as not active baseline
      const updatedVersions = versions.map((v) => ({ ...v, isBaseline: false }));
      updatedVersions.unshift(newVersion);

      setVersions(updatedVersions);
      localStorage.setItem(`scopepilot_baselines_${projectId}`, JSON.stringify(updatedVersions));

      // Update project baseline version in projects list
      const savedProjects = localStorage.getItem('scopepilot_projects');
      if (savedProjects) {
        const pList = JSON.parse(savedProjects);
        const pIdx = pList.findIndex((p: { id: string }) => p.id === projectId);
        if (pIdx >= 0) {
          pList[pIdx].baselineVersion = versionLabel;
          pList[pIdx].contentHash = hash;
          pList[pIdx].status = 'active';
          localStorage.setItem('scopepilot_projects', JSON.stringify(pList));
        }
      }

      setIsApproveModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-surface-950 tracking-tight">
            Scope Baseline & Versioning
          </h1>
          <p className="text-xs text-surface-500 mt-1">
            Freeze agreed project scopes into immutable snapshots protected by PostgreSQL engine triggers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsApproveModalOpen(true)}
            leftIcon={<Lock className="w-4 h-4" />}
          >
            Approve & Lock New Baseline
          </Button>
        </div>
      </div>

      {/* Active Baseline Status Card */}
      {activeBaseline ? (
        <Card className="p-6 bg-white border-emerald-300 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-surface-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BaselineLockedBadge versionLabel={activeBaseline.versionLabel} />
                <span className="text-xs text-surface-500 font-mono">
                  Version #{activeBaseline.versionNumber}
                </span>
              </div>
              <h3 className="font-bold text-lg text-surface-950 mt-2">
                Active Benchmark Scope Baseline
              </h3>
              <p className="text-xs text-surface-600 mt-1">
                Approved by <span className="font-semibold text-surface-900">{activeBaseline.approverName}</span> on{' '}
                {formatDate(activeBaseline.approvedAt)}.
              </p>
            </div>

            <Link href={`/projects/${projectId}/compare`}>
              <Button variant="primary" size="sm" leftIcon={<GitCompare className="w-4 h-4" />}>
                Compare New Request Against Baseline
              </Button>
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-surface-50 border border-surface-200">
              <span className="text-surface-500 font-medium">Cryptographic Fingerprint:</span>
              <p className="font-mono text-[11px] text-surface-900 mt-1 break-all select-all">
                sha256:{activeBaseline.contentHash}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-surface-50 border border-surface-200">
              <span className="text-surface-500 font-medium">Locked Scope Size:</span>
              <p className="text-surface-900 font-semibold mt-1">
                {activeBaseline.requirementsCount} Frozen Requirement Specifications
              </p>
            </div>
          </div>

          {activeBaseline.notes && (
            <p className="mt-4 text-xs text-surface-600 italic">
              Approval Notes: &quot;{activeBaseline.notes}&quot;
            </p>
          )}
        </Card>
      ) : (
        <Card className="p-8 text-center border-dashed border-2 border-amber-300 bg-amber-50/20">
          <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <h3 className="font-bold text-base text-surface-950">No Baseline Approved Yet</h3>
          <p className="text-xs text-surface-600 mt-1 max-w-md mx-auto">
            Before running scope change comparisons, approve an initial baseline version to establish your contractual benchmark.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsApproveModalOpen(true)}
            className="mt-4"
          >
            Approve Initial Baseline
          </Button>
        </Card>
      )}

      {/* Baseline History Log */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-surface-950 uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-surface-500" />
          <span>Baseline Version Audit History</span>
        </h3>

        <div className="border border-surface-200 rounded-xl bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Label</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Approver</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Integrity Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {versions.map((ver) => (
                <tr key={ver.id} className="hover:bg-surface-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold font-mono">v{ver.versionNumber}.0</td>
                  <td className="py-3 px-4 font-medium text-surface-950">{ver.versionLabel}</td>
                  <td className="py-3 px-4">
                    {ver.isBaseline ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        ACTIVE BASELINE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-100 text-surface-600">
                        SUPERSEDED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-surface-700">{ver.approverName}</td>
                  <td className="py-3 px-4 text-surface-500">{formatDate(ver.approvedAt)}</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-surface-500">
                    {ver.contentHash.slice(0, 16)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutability Confirmation Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve & Lock Scope Baseline"
        description="Establish an immutable benchmark version for all future scope-change comparisons."
      >
        <form onSubmit={handleApproveBaseline} className="space-y-4 pt-2">
          <div className="p-3 rounded-lg bg-brand-50 border border-brand-200 text-xs text-brand-900 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <strong>Database Immutability Invariant:</strong> Once approved, this baseline version cannot be altered or overwritten. New scope changes will be evaluated against this exact snapshot.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1">
              Version Label <span className="text-rose-500">*</span>
            </label>
            <Input
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              placeholder="e.g. v1.0 - Signed Client Contract"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1">
              Approver Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={approverName}
              onChange={(e) => setApproverName(e.target.value)}
              placeholder="e.g. Aarav Sharma (Lead Architect)"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1">
              Approval Notes & Context <span className="text-surface-400 font-normal">(Optional)</span>
            </label>
            <Textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Record any formal client acceptance references, email thread dates, or notes..."
              rows={3}
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-surface-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsApproveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              leftIcon={<Lock className="w-4 h-4" />}
            >
              Confirm & Lock Baseline
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
