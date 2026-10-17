'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge, ScopeFindingBadge, BaselineLockedBadge } from '@/components/ui/badge';
import {
  GitCompare,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  DollarSign,
  Send,
  Download,
  Check,
  Clock,
  Layers,
} from 'lucide-react';
import { FindingCategory, DecisionStatus } from '@/types/database.types';

interface FindingViewItem {
  id: string;
  findingType: FindingCategory;
  matchedReqCode: string | null;
  title: string;
  description: string;
  differenceExplanation: string;
  evidenceQuote: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  dependenciesAffected: string[];
  acceptanceCriteriaChanges: string[];
  suggestedClarificationQuestions: string[];
  suggestedAction: string;
  userDecision: DecisionStatus;
  decisionNotes?: string;
}

export default function ScopeComparisonPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonSummary, setComparisonSummary] = useState<string | null>(null);
  const [findings, setFindings] = useState<FindingViewItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'creep' | 'matched' | 'ambiguous'>('all');

  // Preset sample client messages for instant one-click testing
  const presets = [
    {
      label: 'Apple Watch Sync (Hardware Creep)',
      text: 'We want users to connect their Apple Watch directly via Bluetooth to sync heart rate during workouts.',
    },
    {
      label: 'Macro Chart Clarification (Within Scope)',
      text: 'For the macro dashboard (REQ-002), just to clarify, we want the pie chart slices to use green for protein and blue for carbs.',
    },
    {
      label: 'GST Tax Invoicing (Acceptance Criteria)',
      text: 'For the Stripe integration (REQ-003), we now need to support automated Indian GST invoicing with tax breakdown on checkout.',
    },
    {
      label: 'Vague Request (Ambiguous)',
      text: 'The app should feel faster and more modern on mobile devices.',
    },
  ];

  const handleRunComparison = async (overrideText?: string) => {
    const textToAnalyze = overrideText || inputText;
    if (!textToAnalyze.trim()) return;

    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          newRequestText: textToAnalyze,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setComparisonSummary(data.data.summaryOverview);
        const mappedFindings: FindingViewItem[] = (data.data.findings || []).map(
          (f: Record<string, unknown>, idx: number) => ({
            id: `finding-${idx}`,
            findingType: f.findingType as FindingCategory,
            matchedReqCode: (f.matchedReqCode as string) || null,
            title: f.title as string,
            description: f.description as string,
            differenceExplanation: f.differenceExplanation as string,
            evidenceQuote: f.evidenceQuote as string,
            confidenceLevel: f.confidenceLevel as 'high' | 'medium' | 'low',
            dependenciesAffected: (f.dependenciesAffected as string[]) || [],
            acceptanceCriteriaChanges: (f.acceptanceCriteriaChanges as string[]) || [],
            suggestedClarificationQuestions: (f.suggestedClarificationQuestions as string[]) || [],
            suggestedAction: (f.suggestedAction as string) || 'Review with client',
            userDecision: 'pending_review',
          })
        );
        setFindings(mappedFindings);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecisionChange = (findingId: string, decision: DecisionStatus) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, userDecision: decision } : f))
    );
  };

  const filteredFindings = findings.filter((f) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'creep') return f.findingType === 'new_requirement' || f.findingType === 'modified_requirement';
    if (activeFilter === 'matched') return f.findingType === 'matched_requirement';
    if (activeFilter === 'ambiguous') return f.findingType === 'ambiguous_request';
    return true;
  });

  const additionsCount = findings.filter((f) => f.findingType === 'new_requirement').length;
  const modificationsCount = findings.filter((f) => f.findingType === 'modified_requirement').length;
  const ambiguousCount = findings.filter((f) => f.findingType === 'ambiguous_request').length;

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-surface-950 tracking-tight">
              Scope Creep Detection Engine
            </h1>
            <Badge variant="purple" size="sm">AI Auditor Active</Badge>
          </div>
          <p className="text-xs text-surface-500 mt-1">
            Compare new client emails or requirement changes against your locked baseline.
          </p>
        </div>

        <BaselineLockedBadge versionLabel="v1.0 Baseline Locked" />
      </div>

      {/* Client Input Intake Box */}
      <Card className="p-6 bg-white border-surface-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-surface-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Paste New Client Email, Message, or Request:</span>
          </label>
          <span className="text-[11px] text-surface-400">Treated as untrusted raw data</span>
        </div>

        <Textarea
          placeholder="Paste new client requests here (e.g. 'Can we also add Apple Watch sync and export workout history to PDF?')..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={4}
          className="font-mono text-xs"
        />

        {/* Quick Test Presets */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-surface-500">Quick Test Presets:</span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputText(preset.text);
                handleRunComparison(preset.text);
              }}
              className="text-[11px] px-2.5 py-1 rounded-md bg-surface-100 hover:bg-surface-200 text-surface-700 border border-surface-200 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={() => handleRunComparison()}
            isLoading={isLoading}
            leftIcon={<GitCompare className="w-4 h-4" />}
          >
            Run Scope Comparison
          </Button>
        </div>
      </Card>

      {/* Comparison Results Section */}
      {findings.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Overview Banner */}
          <div className="p-5 rounded-2xl bg-white border border-surface-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-100">
              <div>
                <h2 className="text-base font-bold text-surface-950">Audit Findings Summary</h2>
                <p className="text-xs text-surface-600 mt-0.5">{comparisonSummary}</p>
              </div>

              {/* Counts Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {additionsCount > 0 && (
                  <Badge variant="danger">
                    <span>{additionsCount} New Features</span>
                  </Badge>
                )}
                {modificationsCount > 0 && (
                  <Badge variant="warning">
                    <span>{modificationsCount} Modified Deliverables</span>
                  </Badge>
                )}
                {ambiguousCount > 0 && (
                  <Badge variant="purple">
                    <span>{ambiguousCount} Needs Clarification</span>
                  </Badge>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-semibold text-surface-500 mr-1">Filter:</span>
              {(['all', 'creep', 'matched', 'ambiguous'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`text-xs px-3 py-1 rounded-md capitalize transition-all ${
                    activeFilter === tab
                      ? 'bg-brand-600 text-white font-semibold shadow-sm'
                      : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Finding Cards */}
          <div className="space-y-4">
            {filteredFindings.map((finding) => (
              <Card
                key={finding.id}
                className={`p-6 bg-white border transition-all ${
                  finding.findingType === 'new_requirement'
                    ? 'border-rose-300 shadow-rose-500/5'
                    : finding.findingType === 'modified_requirement'
                    ? 'border-amber-300 shadow-amber-500/5'
                    : 'border-surface-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <ScopeFindingBadge type={finding.findingType} />
                      <h3 className="font-bold text-base text-surface-950">{finding.title}</h3>
                      {finding.matchedReqCode && (
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-100 text-surface-800 border border-surface-200">
                          Baseline: {finding.matchedReqCode}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-surface-700 leading-relaxed pt-1">
                      {finding.description}
                    </p>
                  </div>

                  {/* Recommendation action chip */}
                  <div className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface-100 text-surface-800 border border-surface-200 max-w-xs text-right">
                    {finding.suggestedAction}
                  </div>
                </div>

                {/* Direct Quote Evidence */}
                <div className="p-3 rounded-lg bg-surface-50 border border-surface-200 text-xs font-mono text-surface-800 mb-4">
                  <span className="text-[10px] uppercase font-bold text-surface-400 block mb-1">
                    Direct Client Request Quote:
                  </span>
                  &quot;{finding.evidenceQuote}&quot;
                </div>

                {/* Difference Explanation */}
                <div className="text-xs text-surface-600 space-y-1 mb-4 p-3 rounded-lg bg-surface-50/50 border border-surface-100">
                  <span className="font-bold text-surface-900 block">Scope Delta Analysis:</span>
                  <p>{finding.differenceExplanation}</p>
                </div>

                {/* Suggested Clarifying Questions if applicable */}
                {finding.suggestedClarificationQuestions.length > 0 && (
                  <div className="mb-4 p-3 rounded-lg bg-purple-50/50 border border-purple-200 text-xs">
                    <span className="font-bold text-purple-900 block mb-1 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                      Suggested Client Clarification Questions:
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-purple-950/80">
                      {finding.suggestedClarificationQuestions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Human-in-the-Loop Decision Recording */}
                <div className="pt-4 border-t border-surface-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-50/60 -mx-6 -mb-6 p-4 rounded-b-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-surface-800">Your Decision:</span>
                    <select
                      value={finding.userDecision}
                      onChange={(e) =>
                        handleDecisionChange(finding.id, e.target.value as DecisionStatus)
                      }
                      className="text-xs h-8 rounded-lg border border-surface-300 bg-white px-2.5 py-1 text-surface-900 font-medium focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="pending_review">Pending Review</option>
                      <option value="additional_work">Additional Work (Requires Change Order)</option>
                      <option value="included_in_scope">Included in Scope (Courtesy / Minor)</option>
                      <option value="clarification_required">Clarification Required</option>
                      <option value="declined">Declined (Out of Scope)</option>
                      <option value="accepted_as_new_version">Accepted as New Scope Version</option>
                    </select>
                  </div>

                  {finding.userDecision !== 'pending_review' && (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Decision Recorded
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
