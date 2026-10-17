'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  FolderKanban,
  ArrowLeft,
  Building,
  Mail,
  Coins,
  FileText,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { CreateProjectSchema } from '@/lib/validators/project';

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>('INR');
  const [description, setDescription] = useState('');
  const [initialRequirementsText, setInitialRequirementsText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const validation = CreateProjectSchema.safeParse({
        name,
        clientName,
        clientEmail: clientEmail || undefined,
        currency,
        description: description || undefined,
      });

      if (!validation.success) {
        throw new Error(validation.error.errors[0]?.message || 'Please check your inputs.');
      }

      const newProjectId = `proj-${Date.now().toString(36)}`;
      const newProject = {
        id: newProjectId,
        name,
        clientName,
        clientEmail,
        currency,
        description,
        status: 'draft',
        createdAt: new Date().toISOString(),
        requirementsCount: initialRequirementsText ? 1 : 0,
      };

      // Persist to local storage
      const existing = localStorage.getItem('scopepilot_projects');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newProject);
      localStorage.setItem('scopepilot_projects', JSON.stringify(list));

      // If initial text was provided, seed initial requirements
      if (initialRequirementsText) {
        const initialReqs = [
          {
            id: `req-${Date.now().toString(36)}`,
            projectId: newProjectId,
            reqCode: 'REQ-001',
            title: 'Initial Project Requirements Intake',
            description: initialRequirementsText,
            category: 'functional',
            priority: 'must_have',
            acceptanceCriteria: ['Passes core functional requirements defined in client intake text'],
            dependencies: [],
            assumptions: ['Standard browser and network availability'],
            exclusions: ['Out-of-scope third party hardware or integrations not listed'],
            unresolvedQuestions: [],
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem(`scopepilot_reqs_${newProjectId}`, JSON.stringify(initialReqs));
      }

      router.push(`/projects/${newProjectId}/requirements`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to create project. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-surface-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-surface-950 tracking-tight">
          Create New Project
        </h1>
        <p className="text-xs text-surface-500 mt-1">
          Set up a client container and define initial requirements.
        </p>
      </div>

      <Card className="border-surface-200 bg-white shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. E-Commerce Storefront Redesign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Client / Company Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Apex Health Ltd"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  leftIcon={<Building className="w-4 h-4" />}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Client Email <span className="text-surface-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="email"
                  placeholder="client@apexhealth.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">
                Project Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'INR' | 'USD' | 'EUR' | 'GBP')}
                className="flex h-10 w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">
                Project Overview & Objectives <span className="text-surface-400 font-normal">(Optional)</span>
              </label>
              <Textarea
                placeholder="Briefly describe the purpose of this project, primary target users, and key business goals..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Initial Intake Section */}
            <div className="pt-2 border-t border-surface-100">
              <label className="block text-xs font-semibold text-surface-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  Paste Client Email or Raw Requirements
                </span>
                <span className="text-surface-400 font-normal">Optional</span>
              </label>
              <Textarea
                placeholder="Paste the client's initial email, feature list, or raw bullet points here. ScopePilot will automatically extract categorized requirements..."
                value={initialRequirementsText}
                onChange={(e) => setInitialRequirementsText(e.target.value)}
                rows={5}
                className="font-mono text-xs"
              />
              <p className="mt-1 text-[11px] text-surface-500">
                You can also upload documents (PDF, TXT) or add requirements manually on the next screen.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <Link href="/projects">
                <Button variant="ghost" size="md">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
                Create Project & Define Requirements
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
