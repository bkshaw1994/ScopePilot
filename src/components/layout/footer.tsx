import React from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck, Lock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-surface-200 bg-white/50 py-12 text-sm text-surface-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="font-bold text-base text-surface-950">ScopePilot</span>
            </div>
            <p className="text-xs text-surface-500 leading-relaxed">
              Define the scope. Document the agreement. Detect changes before they become unpaid work. Built for freelance developers & boutique agencies.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Multi-Tenant RLS Protected</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-surface-900 mb-3 text-xs uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/#features" className="hover:text-surface-900">Scope Creep Engine</Link></li>
              <li><Link href="/#pricing" className="hover:text-surface-900">Pricing & Plans</Link></li>
              <li><Link href="/#security" className="hover:text-surface-900">Cryptographic Baselines</Link></li>
              <li><Link href="/login" className="hover:text-surface-900">Developer Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-surface-900 mb-3 text-xs uppercase tracking-wider">Security & Privacy</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-surface-600">
                <Lock className="w-3.5 h-3.5 text-surface-400" />
                Zero Public Model Training
              </li>
              <li>Private Storage (Supabase S3)</li>
              <li>PostgreSQL Row Level Security</li>
              <li>India DPDP & GDPR Ready</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-surface-900 mb-3 text-xs uppercase tracking-wider">Currency & Regions</h4>
            <p className="text-xs text-surface-500 mb-2">
              Supports INR (₹), USD ($), EUR (€), and GBP (£). Tailored for Indian tech exporters and global consultants.
            </p>
            <p className="text-[11px] text-surface-400">
              © {new Date().getFullYear()} ScopePilot. All rights reserved.
            </p>
          </div>
        </div>

        <div className="border-t border-surface-200/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-surface-400 gap-4">
          <p>ScopePilot SaaS • Production Phase 1 Architecture</p>
          <div className="flex gap-6">
            <span className="hover:text-surface-600 cursor-pointer">Terms of Service</span>
            <span className="hover:text-surface-600 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-surface-600 cursor-pointer">Security Runbook</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
