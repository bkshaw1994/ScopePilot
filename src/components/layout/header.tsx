import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass, ShieldCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/30 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-surface-950 flex items-center gap-1.5">
              ScopePilot
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                PRO
              </span>
            </span>
            <span className="text-[10px] -mt-1 font-mono text-surface-400">Scope Integrity Engine</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-surface-600">
          <Link href="/#how-it-works" className="hover:text-surface-950 transition-colors">
            How It Works
          </Link>
          <Link href="/#features" className="hover:text-surface-950 transition-colors">
            Scope Change Engine
          </Link>
          <Link href="/#pricing" className="hover:text-surface-950 transition-colors">
            Pricing
          </Link>
          <Link href="/#security" className="hover:text-surface-950 transition-colors flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Security & RLS
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
