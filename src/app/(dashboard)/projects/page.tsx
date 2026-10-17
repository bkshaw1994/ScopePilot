'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FolderKanban,
  Plus,
  Search,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  Inbox,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ProjectItem {
  id: string;
  name: string;
  clientName: string;
  currency: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  description?: string;
  createdAt: string;
  baselineVersion?: string;
  requirementsCount?: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'active' | 'archived'>('all');

  useEffect(() => {
    // Load from local storage or initial demo state
    const saved = localStorage.getItem('scopepilot_projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch {
        setProjects([]);
      }
    } else {
      // Pre-seed an initial starter project so developer can immediately test and explore
      const starterProject: ProjectItem = {
        id: 'proj-fittrack-01',
        name: 'FitTrack Pro SaaS Redesign',
        clientName: 'Apex Health Ltd',
        currency: 'INR',
        status: 'active',
        description: 'Personal fitness and macro tracking dashboard with Stripe subscriptions and mobile sync.',
        createdAt: new Date().toISOString(),
        baselineVersion: 'v1.0 (Signed Agreement)',
        requirementsCount: 6,
      };
      setProjects([starterProject]);
      localStorage.setItem('scopepilot_projects', JSON.stringify([starterProject]));
    }
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-surface-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-950 tracking-tight">
            Projects
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            Manage client agreements, requirement baselines, and change order tracking.
          </p>
        </div>

        <Link href="/projects/new">
          <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
            New Project
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search projects or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-1.5 bg-surface-100 p-1 rounded-lg border border-surface-200 text-xs font-medium self-start sm:self-auto">
          {(['all', 'active', 'draft', 'archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-md capitalize transition-all ${
                filterStatus === status
                  ? 'bg-white text-surface-950 shadow-sm font-semibold'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-surface-300 bg-white">
          <div className="w-12 h-12 rounded-xl bg-surface-100 text-surface-500 flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="font-semibold text-base text-surface-950">No projects found</h3>
          <p className="text-xs text-surface-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'No projects match your search criteria. Try a different query.'
              : 'Create your first project to start defining requirements and freezing your scope baseline.'}
          </p>
          {!searchQuery && (
            <Link href="/projects/new" className="mt-4 inline-block">
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Create Project
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="p-6 bg-white hover:border-brand-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-base text-surface-950 leading-tight">
                      {project.name}
                    </h3>
                    <p className="text-xs text-surface-500 mt-0.5">{project.clientName}</p>
                  </div>
                  <Badge
                    variant={
                      project.status === 'active'
                        ? 'success'
                        : project.status === 'draft'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {project.status}
                  </Badge>
                </div>

                {project.description && (
                  <p className="text-xs text-surface-600 line-clamp-2 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                )}

                <div className="space-y-1.5 text-xs text-surface-500 pt-3 border-t border-surface-100">
                  <div className="flex items-center justify-between">
                    <span>Currency:</span>
                    <span className="font-semibold text-surface-800">{project.currency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Requirements:</span>
                    <span className="font-semibold text-surface-800">
                      {project.requirementsCount || 0} items
                    </span>
                  </div>
                  {project.baselineVersion && (
                    <div className="flex items-center justify-between text-emerald-700 font-medium">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Baseline:
                      </span>
                      <span>{project.baselineVersion}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-100 flex items-center justify-between">
                <span className="text-[11px] text-surface-400">
                  {formatDate(project.createdAt)}
                </span>
                <Link href={`/projects/${project.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                    <span>Open Scope</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
