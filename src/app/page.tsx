'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge, ScopeFindingBadge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Compass,
  ShieldCheck,
  Zap,
  Lock,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  FileText,
  DollarSign,
  TrendingDown,
  Layers,
  Sparkles,
  GitCompare,
  HelpCircle,
  Eye,
} from 'lucide-react';

export default function LandingPage() {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [demoActiveTab, setDemoActiveTab] = useState<'all' | 'creep' | 'matched'>('all');

  const demoFindings = [
    {
      id: 'FIND-01',
      type: 'new_requirement' as const,
      title: 'Apple Watch Bluetooth Sync',
      quote: '"We want users to connect their Apple Watch directly via Bluetooth to sync heart rate during workouts."',
      baselineRef: 'REQ-EXCL-01 (Explicitly Excluded in v1.0 Agreement)',
      explanation: 'Wearable hardware integration was explicitly listed as an out-of-scope deliverable in the approved v1.0 baseline.',
      action: 'Requires Change Order #02 • Estimated +35 hrs (₹52,500 / $700)',
      category: 'creep',
    },
    {
      id: 'FIND-02',
      type: 'matched_requirement' as const,
      title: 'Pie Chart Macro Slices (Green for Protein)',
      quote: '"For the macro dashboard, just to clarify, we want the pie chart slices to use green for protein and blue for carbs."',
      baselineRef: 'REQ-002: Daily Calorie & Macro Tracking Dashboard',
      explanation: 'UI color clarification falls fully within the agreed REQ-002 deliverable. No additional charge.',
      action: 'Included in scope • Documented styling preference',
      category: 'matched',
    },
    {
      id: 'FIND-03',
      type: 'ambiguous_request' as const,
      title: 'App Speed & Feel on Mobile',
      quote: '"The app should feel faster and more modern on mobile devices."',
      baselineRef: 'Non-Functional Performance Baseline',
      explanation: 'Subjective request with no measurable acceptance criteria. System prepared targeted clarification questions.',
      action: 'Clarification Required: Send clarifying questions to client',
      category: 'creep',
    },
  ];

  const filteredFindings =
    demoActiveTab === 'all'
      ? demoFindings
      : demoFindings.filter((f) => f.category === demoActiveTab);

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-surface-200/60 bg-gradient-to-b from-white via-surface-50/50 to-surface-100/30">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-brand-300/20 via-indigo-400/15 to-purple-400/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
              <span>AI Scope Creep Detection for Developers & Agencies</span>
              <span className="w-1 h-1 rounded-full bg-brand-300" />
              <span className="text-surface-500 font-normal">India & Global SaaS</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-surface-950 tracking-tight max-w-4xl mx-auto leading-[1.12]">
              Define the scope.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600">
                Document the agreement.
              </span>{' '}
              Detect changes before they become unpaid work.
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-surface-600 max-w-2xl mx-auto leading-relaxed">
              Never get bullied by mid-project client demands again. ScopePilot locks your agreed baseline with cryptographic hashes and accurately detects new feature requests against it.
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto px-8 shadow-md shadow-brand-500/25">
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white">
                  <span>View Live Demo Dashboard</span>
                </Button>
              </Link>
            </div>

            {/* Trust Micro-Metrics */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs text-surface-500 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>PostgreSQL RLS Protected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-brand-600" />
                <span>Zero AI Model Training on Specs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-purple-600" />
                <span>Immutable SHA-256 Scope Baselines</span>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE SCOPE SIMULATOR PREVIEW */}
        <section className="py-16 bg-white border-b border-surface-200/80" id="features">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <Badge variant="purple" className="mb-2">
                <GitCompare className="w-3.5 h-3.5" />
                <span>Interactive Live Demo</span>
              </Badge>
              <h2 className="text-3xl font-bold text-surface-950 tracking-tight">
                How ScopePilot Detects Creep in Real Time
              </h2>
              <p className="mt-2 text-surface-600 text-sm">
                A client emails: <span className="italic font-medium">&quot;Can we also add Apple Watch Bluetooth and change macro chart colors?&quot;</span> Here is what ScopePilot outputs instantly:
              </p>
            </div>

            {/* Interactive Preview Container */}
            <div className="rounded-2xl border border-surface-200 bg-surface-50/60 p-4 sm:p-6 shadow-xl shadow-surface-950/5">
              {/* Simulator Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-surface-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-surface-950">
                      Comparison Run #04 • Project: FitTrack Pro SaaS
                    </h3>
                    <p className="text-xs text-surface-500 font-mono">
                      Baseline: v1.0 (Hash: 4a9f2...locked) • Client Input: Email Snippet
                    </p>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 bg-surface-200/70 p-1 rounded-lg text-xs font-medium">
                  <button
                    onClick={() => setDemoActiveTab('all')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      demoActiveTab === 'all'
                        ? 'bg-white text-surface-950 shadow-sm'
                        : 'text-surface-600 hover:text-surface-900'
                    }`}
                  >
                    All Findings (3)
                  </button>
                  <button
                    onClick={() => setDemoActiveTab('creep')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      demoActiveTab === 'creep'
                        ? 'bg-white text-rose-700 shadow-sm font-semibold'
                        : 'text-surface-600 hover:text-surface-900'
                    }`}
                  >
                    Scope Changes (2)
                  </button>
                  <button
                    onClick={() => setDemoActiveTab('matched')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      demoActiveTab === 'matched'
                        ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                        : 'text-surface-600 hover:text-surface-900'
                    }`}
                  >
                    Within Scope (1)
                  </button>
                </div>
              </div>

              {/* Findings Cards */}
              <div className="mt-6 space-y-4">
                {filteredFindings.map((finding) => (
                  <div
                    key={finding.id}
                    className="p-5 rounded-xl border bg-white shadow-sm hover:border-brand-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <ScopeFindingBadge type={finding.type} />
                        <h4 className="font-semibold text-sm text-surface-950">{finding.title}</h4>
                      </div>
                      <p className="text-xs text-surface-600 font-mono bg-surface-100 p-2 rounded-md border border-surface-200">
                        {finding.quote}
                      </p>
                      <div className="text-xs text-surface-500 space-y-1">
                        <p>
                          <span className="font-medium text-surface-700">Baseline Context:</span>{' '}
                          {finding.baselineRef}
                        </p>
                        <p>
                          <span className="font-medium text-surface-700">Explanation:</span>{' '}
                          {finding.explanation}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-start md:items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto">
                      <div className="text-xs font-semibold px-2.5 py-1 rounded-md bg-surface-100 text-surface-800 border border-surface-200">
                        {finding.action}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          Send Clarification
                        </Button>
                        <Button variant="primary" size="sm" className="text-xs h-8">
                          Create Change Order
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Footer */}
              <div className="mt-6 pt-4 border-t border-surface-200 flex flex-col sm:flex-row items-center justify-between text-xs text-surface-500 gap-2">
                <span>
                  Outcome: Developer protected <strong>₹52,500 ($700)</strong> in unbilled engineering work.
                </span>
                <Link href="/register" className="text-brand-600 font-semibold hover:underline flex items-center gap-1">
                  Run a comparison on your client spec <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* THE CORE PROBLEM & VALUE PROPOSITION */}
        <section className="py-20 bg-surface-50 border-b border-surface-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-surface-950 tracking-tight">
                Why Developers Lose 20–30% of Fixed-Price Project Margins
              </h2>
              <p className="mt-4 text-surface-600 text-base">
                Scope creep isn&apos;t caused by malicious clients. It is caused by lost baselines and subjective memory.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6 bg-white border-surface-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-surface-950 mb-2">Unclear Exclusions</h3>
                <p className="text-sm text-surface-600 leading-relaxed">
                  Developers list what they will build, but forget to explicitly list what is excluded (like third-party API costs, multilingual translations, or wearable sync). ScopePilot drafts explicit exclusions automatically.
                </p>
              </Card>

              <Card className="p-6 bg-white border-surface-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-surface-950 mb-2">The Memory Trap</h3>
                <p className="text-sm text-surface-600 leading-relaxed">
                  Four weeks into development, client says: &quot;I thought this was already included.&quot; Without an immutable, signed baseline snapshot, pushing back risks damaging client trust.
                </p>
              </Card>

              <Card className="p-6 bg-white border-surface-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-surface-950 mb-2">Objective Evidence</h3>
                <p className="text-sm text-surface-600 leading-relaxed">
                  ScopePilot generates clean, objective Scope Change Reports with side-by-side evidence quotes. You aren&apos;t arguing—you are providing an objective audit report.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="py-20 bg-white" id="pricing">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Badge variant="default" className="mb-2">Transparent Pricing</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-surface-950 tracking-tight">
                Pays for Itself with Just One Prevented Scope Creep
              </h2>
              <p className="mt-3 text-surface-600 text-sm">
                No hidden charges. Choose INR (₹) or USD ($).
              </p>

              {/* Currency Selector */}
              <div className="mt-6 inline-flex items-center gap-1 p-1 bg-surface-100 rounded-lg border border-surface-200">
                <button
                  onClick={() => setCurrency('INR')}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    currency === 'INR'
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-surface-600 hover:text-surface-900'
                  }`}
                >
                  INR (₹ India)
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    currency === 'USD'
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-surface-600 hover:text-surface-900'
                  }`}
                >
                  USD ($ International)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Tier */}
              <Card className="p-8 border-surface-200 bg-surface-50 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-surface-950">Free Starter</h3>
                  <p className="text-xs text-surface-500 mt-1">For freelancers trying their first project.</p>
                  <div className="mt-6 mb-6">
                    <span className="text-3xl font-extrabold text-surface-950">
                      {currency === 'INR' ? '₹0' : '$0'}
                    </span>
                    <span className="text-xs text-surface-500"> / forever</span>
                  </div>
                  <ul className="space-y-3 text-xs text-surface-600 mb-8">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> 1 Active Project</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> 5 AI Requirement Extractions</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> 2 Baseline Version Locks</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> PDF Scope Export</li>
                  </ul>
                </div>
                <Link href="/register">
                  <Button variant="outline" className="w-full bg-white">Get Started</Button>
                </Link>
              </Card>

              {/* Pro Tier (Highlighted) */}
              <Card className="p-8 border-brand-500 bg-white shadow-xl shadow-brand-500/10 relative flex flex-col justify-between scale-105">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
                <div>
                  <h3 className="font-bold text-lg text-surface-950">Pro Developer</h3>
                  <p className="text-xs text-surface-500 mt-1">For full-time freelancers and consultants.</p>
                  <div className="mt-6 mb-6">
                    <span className="text-4xl font-extrabold text-brand-600">
                      {currency === 'INR' ? '₹1,499' : '$19'}
                    </span>
                    <span className="text-xs text-surface-500"> / month</span>
                  </div>
                  <ul className="space-y-3 text-xs text-surface-600 mb-8">
                    <li className="flex items-center gap-2 font-semibold text-surface-950"><CheckCircle className="w-4 h-4 text-brand-600" /> Unlimited Projects</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-600" /> Unlimited Scope Change Comparisons</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-600" /> Cryptographic SHA-256 Baseline Locking</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-600" /> Custom Proposal PDF Generator</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-600" /> Change Order Summary Reports</li>
                  </ul>
                </div>
                <Link href="/register">
                  <Button variant="primary" className="w-full shadow-md shadow-brand-500/25">
                    Start 14-Day Free Trial
                  </Button>
                </Link>
              </Card>

              {/* Agency Tier */}
              <Card className="p-8 border-surface-200 bg-surface-50 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-surface-950">Boutique Agency</h3>
                  <p className="text-xs text-surface-500 mt-1">For small software agencies (2-10 devs).</p>
                  <div className="mt-6 mb-6">
                    <span className="text-3xl font-extrabold text-surface-950">
                      {currency === 'INR' ? '₹3,999' : '$49'}
                    </span>
                    <span className="text-xs text-surface-500"> / month</span>
                  </div>
                  <ul className="space-y-3 text-xs text-surface-600 mb-8">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Everything in Pro</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Up to 5 Team Members</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Custom Agency Branding on PDFs</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Priority Gemini 2.0 Processing</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Audit Trail & Compliance Export</li>
                  </ul>
                </div>
                <Link href="/register">
                  <Button variant="outline" className="w-full bg-white">Get Started</Button>
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="py-20 bg-gradient-to-tr from-brand-900 via-indigo-900 to-surface-950 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Stop letting scope creep destroy your project profitability.
            </h2>
            <p className="mt-4 text-brand-200 text-base max-w-xl mx-auto">
              Set up your first project in 2 minutes. Paste your client specs, freeze the baseline, and work with confidence.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-brand-900 hover:bg-brand-50 shadow-lg px-8 font-semibold">
                  <span>Create Your Free Account</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
