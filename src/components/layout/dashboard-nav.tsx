'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  LayoutDashboard,
  FolderKanban,
  GitCompare,
  FileText,
  ShieldCheck,
  Settings,
  LogOut,
  Plus,
  Coins,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/db/client';

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Projects',
      href: '/projects',
      icon: FolderKanban,
    },
    {
      label: 'Scope Creep Engine',
      href: '/compare',
      icon: GitCompare,
    },
    {
      label: 'Settings & Account',
      href: '/settings',
      icon: Settings,
    },
  ];

  const handleSignOut = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('your-project-id')) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
      sessionStorage.clear();
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  return (
    <aside className="w-64 border-r border-surface-200 bg-white flex flex-col justify-between shrink-0 min-h-screen">
      {/* Top Branding & New Project */}
      <div className="p-4 space-y-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/30">
            <Compass className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-surface-950 tracking-tight flex items-center gap-1.5">
              ScopePilot
            </span>
            <span className="text-[10px] -mt-1 font-mono text-surface-400">v1.0 Baseline Engine</span>
          </div>
        </Link>

        <div>
          <Link href="/projects/new">
            <Button
              variant="primary"
              size="sm"
              className="w-full justify-start shadow-sm shadow-brand-500/20"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Project
            </Button>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-surface-600 hover:text-surface-950 hover:bg-surface-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-surface-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Usage Status */}
      <div className="p-4 border-t border-surface-200 space-y-4">
        {/* Token Budget Meter */}
        <div className="p-3 rounded-lg bg-surface-50 border border-surface-200 text-xs">
          <div className="flex items-center justify-between text-surface-600 mb-1.5">
            <span className="flex items-center gap-1 font-medium">
              <Coins className="w-3.5 h-3.5 text-brand-600" />
              AI Monthly Quota
            </span>
            <span className="font-mono text-[11px] text-surface-500">12%</span>
          </div>
          <div className="w-full h-1.5 bg-surface-200 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full w-[12%]" />
          </div>
          <p className="mt-1 text-[10px] text-surface-400">440k / 500k tokens remaining</p>
        </div>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
