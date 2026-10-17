import React from 'react';
import { DashboardNav } from '@/components/layout/dashboard-nav';
import { ShieldCheck, User } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-surface-50">
      {/* Sidebar Nav */}
      <DashboardNav />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-surface-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RLS Tenant Boundary Active</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-surface-900 leading-none">
                  Developer Account
                </span>
                <span className="text-[10px] text-surface-500 font-mono mt-0.5">
                  Pro Plan • INR
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Workspace Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
