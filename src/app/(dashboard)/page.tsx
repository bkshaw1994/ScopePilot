'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge, ScopeFindingBadge } from '@/components/ui/badge';
import {
  FolderKanban,
  FileCheck2,
  GitCompare,
  Plus,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Inbox,
  AlertTriangle,
} from 'lucide-react';

interface ProjectSummary {
  id: string;
  name: string;
  clientName: string;
  currency: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  baselineVersion?: string;
  requirementsCount: number;
  lastUpdated: string;
}

export default function DashboardOverviewPage() {
  // Real state (initially checks for user created projects from storage or API)
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check local storage for initial client session demo/persisted projects
    const saved = localStorage.getItem('scopepilot_projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch {
        setProjects([]);
      }
    }
  }, []);

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const approvedBaselines = projects.filter((p) => p.baselineVersion).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-surface-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-950 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            Monitor client requirements, frozen baselines, and scope creep detection runs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/projects/new">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 bg-white border-surface-200 shadow-sm">
          <div className="flex items-center justify-between text-surface-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Projects</span>
            <FolderKanban className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-3xl font-extrabold text-surface-950">{totalProjects}</div>
          <p className="mt-1.5 text-xs text-surface-500">Managed in your tenant</p>
        </Card>

        <Card className="p-5 bg-white border-surface-200 shadow-sm">
          <div className="flex items-center justify-between text-surface-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Projects</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-surface-950">{activeProjects}</div>
          <p className="mt-1.5 text-xs text-surface-500">Under development</p>
        </Card>

        <Card className="p-5 bg-white border-surface-200 shadow-sm">
          <div className="flex items-center justify-between text-surface-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved Baselines</span>
            <FileCheck2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-surface-950">{approvedBaselines}</div>
          <p className="mt-1.5 text-xs text-surface-500">Locked with SHA-256</p>
        </Card>

        <Card className="p-5 bg-white border-surface-200 shadow-sm">
          <div className="flex items-center justify-between text-surface-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Scope Engine</span>
            <GitCompare className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-3xl font-extrabold text-surface-950">Active</div>
          <p className="mt-1.5 text-xs text-surface-500">Gemini 1.5/2.0 Ready</p>
        </Card>
      </div>

      {/* Main Content: Projects & Activity or Empty State */}
      {totalProjects === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-surface-300 bg-white">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h2 className="text-lg font-bold text-surface-950">No projects created yet</h2>
          <p className="mt-1.5 text-sm text-surface-500 max-w-md mx-auto">
            Get started by creating your first client project. You can paste client emails or upload requirement documents to automatically extract structured requirements and lock your baseline.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/projects/new">
              <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
                Create Your First Project
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-surface-950">Active Client Projects</h2>
            <Link href="/projects" className="text-xs font-semibold text-brand-600 hover:underline">
              View all projects
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="p-6 hover:border-brand-300 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-base text-surface-950">{project.name}</h3>
                    <p className="text-xs text-surface-500">{project.clientName}</p>
                  </div>
                  <Badge variant={project.status === 'active' ? 'success' : 'default'}>
                    {project.status}
                  </Badge>
                </div>

                <div className="text-xs text-surface-600 space-y-1 mb-4">
                  <p>
                    <span className="font-medium text-surface-900">Currency:</span>{' '}
                    {project.currency}
                  </p>
                  <p>
                    <span className="font-medium text-surface-900">Requirements:</span>{' '}
                    {project.requirementsCount} items
                  </p>
                  {project.baselineVersion && (
                    <p className="text-emerald-700 font-medium">
                      ✓ Baseline: {project.baselineVersion}
                    </p>
                  )}
                </div>

                <Link href={`/projects/${project.id}`}>
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    <span>Open Project Scope</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Scope Integrity & Security Note */}
      <div className="p-4 rounded-xl bg-surface-100/80 border border-surface-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-surface-600 gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Deterministic Audit Guarantee:</strong> Approved baselines cannot be silently overwritten by any user or AI workflow.
          </span>
        </div>
        <Link href="/#security" className="text-brand-600 hover:underline shrink-0 font-medium">
          Learn about baseline triggers →
        </Link>
      </div>
    </div>
  );
}
