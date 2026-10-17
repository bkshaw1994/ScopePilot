'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitCompare, FolderKanban, ArrowRight, ShieldCheck, Plus } from 'lucide-react';

export default function GlobalScopeComparePage() {
  const [projects, setProjects] = useState<
    Array<{ id: string; name: string; clientName: string; baselineVersion?: string }>
  >([]);

  useEffect(() => {
    const saved = localStorage.getItem('scopepilot_projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch {
        setProjects([]);
      }
    } else {
      setProjects([
        {
          id: 'proj-fittrack-01',
          name: 'FitTrack Pro SaaS Redesign',
          clientName: 'Apex Health Ltd',
          baselineVersion: 'v1.0 (Signed Agreement)',
        },
      ]);
    }
  }, []);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="pb-6 border-b border-surface-200">
        <h1 className="text-2xl font-bold text-surface-950 tracking-tight">
          Scope Creep Detection Engine
        </h1>
        <p className="text-xs text-surface-500 mt-1">
          Select an active project with an approved baseline to evaluate new client requests.
        </p>
      </div>

      <div className="space-y-4">
        {projects.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-2 border-surface-300 bg-white">
            <h3 className="font-bold text-base text-surface-950">No Projects Available</h3>
            <p className="text-xs text-surface-500 mt-1 max-w-sm mx-auto">
              Create a project and lock an initial scope baseline to start detecting scope creep.
            </p>
            <Link href="/projects/new" className="mt-4 inline-block">
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Create New Project
              </Button>
            </Link>
          </Card>
        ) : (
          projects.map((project) => (
            <Card
              key={project.id}
              className="p-6 bg-white hover:border-brand-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-surface-950">{project.name}</h3>
                  {project.baselineVersion && (
                    <Badge variant="success" size="sm">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{project.baselineVersion}</span>
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-surface-500">Client: {project.clientName}</p>
              </div>

              <Link href={`/projects/${project.id}/compare`}>
                <Button variant="primary" size="sm" leftIcon={<GitCompare className="w-4 h-4" />}>
                  <span>Run Scope Comparison</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
