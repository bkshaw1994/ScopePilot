import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, PlusCircle, HelpCircle, MinusCircle, ShieldCheck } from 'lucide-react';
import { FindingCategory } from '@/types/database.types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'md', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-surface-100 text-surface-800 border-surface-200',
    outline: 'bg-transparent text-surface-700 border-surface-300',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 rounded-md gap-1',
    md: 'text-xs px-2.5 py-1 rounded-full gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border select-none transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Specialized badge for the 5 scope change detection categories
 * Uses distinct icons, labels, and color contrast.
 */
export function ScopeFindingBadge({ type }: { type: FindingCategory }) {
  switch (type) {
    case 'matched_requirement':
      return (
        <Badge variant="success">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Within Scope</span>
        </Badge>
      );
    case 'new_requirement':
      return (
        <Badge variant="danger">
          <PlusCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>New Scope / Creep</span>
        </Badge>
      );
    case 'modified_requirement':
      return (
        <Badge variant="warning">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Modified Requirement</span>
        </Badge>
      );
    case 'removed_requirement':
      return (
        <Badge variant="default">
          <MinusCircle className="w-3.5 h-3.5 text-surface-500" />
          <span>Removed Item</span>
        </Badge>
      );
    case 'ambiguous_request':
      return (
        <Badge variant="purple">
          <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
          <span>Ambiguous / Review Needed</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="default">
          <span>{type}</span>
        </Badge>
      );
  }
}

export function BaselineLockedBadge({ versionLabel }: { versionLabel: string }) {
  return (
    <Badge variant="success" className="bg-emerald-50/80 text-emerald-800 border-emerald-300 font-mono">
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
      <span>{versionLabel} (Baseline Locked)</span>
    </Badge>
  );
}
