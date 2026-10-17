'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  FolderKanban,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  Layers,
  Sparkles,
  Trash2,
  FileCheck2,
} from 'lucide-react';
import { RequirementCategory, RequirementPriority } from '@/types/database.types';

interface RequirementItem {
  id: string;
  reqCode: string;
  title: string;
  description: string;
  category: RequirementCategory;
  priority: RequirementPriority;
  acceptanceCriteria: string[];
  dependencies: string[];
  assumptions: string[];
  exclusions: string[];
  unresolvedQuestions: string[];
  isActive: boolean;
}

// Default seed requirements for initial demonstration
const DEFAULT_REQS: RequirementItem[] = [
  {
    id: 'req-01',
    reqCode: 'REQ-001',
    title: 'Email & Password Authentication',
    description: 'Users can register, sign in, and reset their password using verified email address.',
    category: 'functional',
    priority: 'must_have',
    acceptanceCriteria: [
      'Secure password minimum 8 characters with at least one number',
      'Email confirmation link sent within 15 seconds',
      'Session persists in secure HTTP-only cookie',
    ],
    dependencies: ['Supabase Auth API'],
    assumptions: ['Transactional email delivery provided by configured provider'],
    exclusions: ['No SMS OTP verification in v1.0', 'No enterprise SAML SSO'],
    unresolvedQuestions: [],
    isActive: true,
  },
  {
    id: 'req-02',
    reqCode: 'REQ-002',
    title: 'Daily Calorie & Macro Tracking Dashboard',
    description: 'Interactive dashboard showing daily calories and breakdown of carbohydrates, protein, and fat.',
    category: 'functional',
    priority: 'must_have',
    acceptanceCriteria: [
      'Interactive pie chart visualizing macro percentages',
      'Daily goal progress bar updating in real time',
      'Quick-log button for common food items',
    ],
    dependencies: ['REQ-001 (User Auth)'],
    assumptions: ['Nutrient database provided by USDA open food dataset'],
    exclusions: ['No AI barcode scanning camera intake in v1.0'],
    unresolvedQuestions: [],
    isActive: true,
  },
  {
    id: 'req-03',
    reqCode: 'REQ-003',
    title: 'Stripe Monthly Subscription Payment Integration',
    description: 'Payment gateway integration to bill users ₹1,499 ($19) recurring per month for Pro access.',
    category: 'integration',
    priority: 'must_have',
    acceptanceCriteria: [
      'Stripe Checkout hosted session redirect',
      'Webhook handler automatically updates user subscription status to active',
      'Customer billing portal link for self-serve cancellation',
    ],
    dependencies: ['Stripe API Keys', 'REQ-001 (User Auth)'],
    assumptions: ['Client has verified active Stripe merchant account in good standing'],
    exclusions: ['No manual bank transfer or offline UPI invoice processing'],
    unresolvedQuestions: ['Confirm if Indian GST invoicing must be itemized on checkout'],
    isActive: true,
  },
  {
    id: 'req-04',
    reqCode: 'REQ-EXCL-01',
    title: 'Explicit Exclusion: No Wearable Bluetooth Sync in v1.0',
    description: 'Direct Bluetooth communication with hardware wearables (Apple Watch, Garmin, Fitbit) is strictly out of scope for v1.0.',
    category: 'exclusion',
    priority: 'must_have',
    acceptanceCriteria: [
      'Mobile app reads manual entries only; no background Bluetooth daemon',
    ],
    dependencies: [],
    assumptions: ['Wearable companion app deferred to Phase 2 Change Order'],
    exclusions: ['All Apple HealthKit & Google Fit automated Bluetooth hardware listeners'],
    unresolvedQuestions: [],
    isActive: true,
  },
];

export default function RequirementsEditorPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for new requirement
  const [newReqCode, setNewReqCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<RequirementCategory>('functional');
  const [newPriority, setNewPriority] = useState<RequirementPriority>('must_have');
  const [newCriteriaText, setNewCriteriaText] = useState('');
  const [newExclusionsText, setNewExclusionsText] = useState('');
  const [newAssumptionsText, setNewAssumptionsText] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`scopepilot_reqs_${projectId}`);
    if (saved) {
      try {
        setRequirements(JSON.parse(saved));
      } catch {
        setRequirements(DEFAULT_REQS);
      }
    } else {
      setRequirements(DEFAULT_REQS);
      localStorage.setItem(`scopepilot_reqs_${projectId}`, JSON.stringify(DEFAULT_REQS));
    }
  }, [projectId]);

  const handleSaveRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) return;

    const code = newReqCode || `REQ-${(requirements.length + 1).toString().padStart(3, '0')}`;
    const criteria = newCriteriaText
      ? newCriteriaText.split('\n').map((s) => s.trim()).filter(Boolean)
      : [];
    const exclusions = newExclusionsText
      ? newExclusionsText.split('\n').map((s) => s.trim()).filter(Boolean)
      : [];
    const assumptions = newAssumptionsText
      ? newAssumptionsText.split('\n').map((s) => s.trim()).filter(Boolean)
      : [];

    const newReq: RequirementItem = {
      id: `req-${Date.now().toString(36)}`,
      reqCode: code,
      title: newTitle,
      description: newDescription,
      category: newCategory,
      priority: newPriority,
      acceptanceCriteria: criteria,
      dependencies: [],
      assumptions,
      exclusions,
      unresolvedQuestions: [],
      isActive: true,
    };

    const updated = [...requirements, newReq];
    setRequirements(updated);
    localStorage.setItem(`scopepilot_reqs_${projectId}`, JSON.stringify(updated));

    // Reset form
    setNewReqCode('');
    setNewTitle('');
    setNewDescription('');
    setNewCategory('functional');
    setNewCriteriaText('');
    setNewExclusionsText('');
    setNewAssumptionsText('');
    setIsAddModalOpen(false);
  };

  const handleDeleteRequirement = (id: string) => {
    const updated = requirements.filter((r) => r.id !== id);
    setRequirements(updated);
    localStorage.setItem(`scopepilot_reqs_${projectId}`, JSON.stringify(updated));
  };

  const filteredRequirements =
    filterCategory === 'all'
      ? requirements
      : requirements.filter((r) => r.category === filterCategory);

  return (
    <div className="space-y-6 animate-fade-in">
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

      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-surface-200">
        <div>
          <h1 className="text-2xl font-bold text-surface-950 tracking-tight">
            Structured Requirements Editor
          </h1>
          <p className="text-xs text-surface-500 mt-1">
            Define deliverables, acceptance criteria, and explicit technical exclusions before freezing the baseline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/projects/${projectId}/baseline`}>
            <Button variant="outline" size="sm" leftIcon={<FileCheck2 className="w-4 h-4" />}>
              Lock Baseline
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Requirement
          </Button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: 'all', label: `All (${requirements.length})` },
          { key: 'functional', label: 'Functional' },
          { key: 'non_functional', label: 'Non-Functional' },
          { key: 'integration', label: 'Integrations' },
          { key: 'exclusion', label: 'Explicit Exclusions' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterCategory(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              filterCategory === tab.key
                ? 'bg-brand-50 border-brand-300 text-brand-800 font-semibold shadow-sm'
                : 'bg-white border-surface-200 text-surface-600 hover:border-surface-300 hover:text-surface-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requirements List */}
      <div className="space-y-4">
        {filteredRequirements.map((req) => (
          <Card
            key={req.id}
            className={`p-6 bg-white transition-all ${
              req.category === 'exclusion'
                ? 'border-amber-200 bg-amber-50/20'
                : 'border-surface-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-100 text-surface-800 border border-surface-200">
                    {req.reqCode}
                  </span>
                  <h3 className="font-bold text-base text-surface-950">{req.title}</h3>
                  <Badge
                    variant={
                      req.category === 'exclusion'
                        ? 'warning'
                        : req.category === 'integration'
                        ? 'info'
                        : 'default'
                    }
                  >
                    {req.category}
                  </Badge>
                  <Badge variant="outline" size="sm">
                    {req.priority.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-xs text-surface-600 leading-relaxed pt-1">
                  {req.description}
                </p>
              </div>

              <button
                onClick={() => handleDeleteRequirement(req.id)}
                className="text-surface-400 hover:text-rose-600 p-1 rounded transition-colors self-end sm:self-auto"
                title="Delete requirement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Acceptance Criteria */}
            {req.acceptanceCriteria && req.acceptanceCriteria.length > 0 && (
              <div className="mt-4 pt-3 border-t border-surface-100">
                <h4 className="text-xs font-semibold text-surface-700 mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Acceptance Criteria:</span>
                </h4>
                <ul className="space-y-1 text-xs text-surface-600 pl-5 list-disc">
                  {req.acceptanceCriteria.map((ac, idx) => (
                    <li key={idx}>{ac}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exclusions */}
            {req.exclusions && req.exclusions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-surface-100">
                <h4 className="text-xs font-semibold text-amber-800 mb-1.5 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Explicit Exclusions (Out of Scope):</span>
                </h4>
                <ul className="space-y-1 text-xs text-amber-900/80 pl-5 list-disc">
                  {req.exclusions.map((ex, idx) => (
                    <li key={idx}>{ex}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Add Requirement Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Project Requirement"
        description="Add a structured requirement item to your active project specification."
      >
        <form onSubmit={handleSaveRequirement} className="space-y-4 pt-2">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">
                Req Code
              </label>
              <Input
                placeholder="REQ-005"
                value={newReqCode}
                onChange={(e) => setNewReqCode(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as RequirementCategory)}
                className="flex h-10 w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-xs text-surface-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <option value="functional">Functional</option>
                <option value="non_functional">Non-Functional</option>
                <option value="integration">Integration</option>
                <option value="ui_ux">UI / UX</option>
                <option value="security">Security</option>
                <option value="exclusion">Explicit Exclusion</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as RequirementPriority)}
                className="flex h-10 w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-xs text-surface-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <option value="must_have">Must Have</option>
                <option value="should_have">Should Have</option>
                <option value="could_have">Could Have</option>
                <option value="nice_to_have">Nice To Have</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1">
              Requirement Title <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="e.g. Google OAuth 2.0 Social Login"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <Textarea
              placeholder="Explain the functional behavior, expected outputs, and constraints..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1">
              Acceptance Criteria <span className="text-surface-400 font-normal">(One per line)</span>
            </label>
            <Textarea
              placeholder="User can click 'Sign in with Google'&#10;Google profile email automatically links to user profile&#10;Token expires after 30 days"
              value={newCriteriaText}
              onChange={(e) => setNewCriteriaText(e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1">
              Explicit Exclusions <span className="text-surface-400 font-normal">(What is NOT included)</span>
            </label>
            <Textarea
              placeholder="e.g. No Apple Sign-In or Facebook OAuth in this milestone"
              value={newExclusionsText}
              onChange={(e) => setNewExclusionsText(e.target.value)}
              rows={2}
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-surface-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Requirement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
