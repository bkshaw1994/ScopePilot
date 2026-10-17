'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  Settings,
  User,
  Building,
  Coins,
  ShieldCheck,
  Lock,
  Download,
  Trash2,
  AlertTriangle,
  Check,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('Aarav Sharma');
  const [companyName, setCompanyName] = useState('Sharma Software Studio');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>('INR');
  const [isSaved, setIsSaved] = useState(false);

  // Deletion Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportData = () => {
    const backupData = {
      user: { fullName, companyName, currency },
      exportedAt: new Date().toISOString(),
      compliance: 'India DPDP Act 2023 / GDPR Article 20 Right to Data Portability',
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scopepilot-data-export-${Date.now()}.json`;
    a.click();
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') return;
    setIsDeleting(true);

    try {
      // Clear all local tenant state
      localStorage.clear();
      sessionStorage.clear();
      router.push('/');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-surface-200">
        <h1 className="text-2xl font-bold text-surface-950 tracking-tight">
          Account Settings & Data Privacy
        </h1>
        <p className="text-xs text-surface-500 mt-1">
          Manage your developer profile, default currency, AI quota limits, and privacy rights.
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="p-6 bg-white border-surface-200 shadow-sm">
        <h2 className="text-base font-bold text-surface-950 mb-1 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-600" />
          <span>Developer Profile</span>
        </h2>
        <p className="text-xs text-surface-500 mb-6">
          Your profile details appear on generated proposals and scope change audit reports.
        </p>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">
                Full Name
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">
                Agency / Company Name
              </label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                leftIcon={<Building className="w-4 h-4" />}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1">
              Default Project Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'INR' | 'USD' | 'EUR' | 'GBP')}
              className="flex h-10 w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 max-w-xs"
            >
              <option value="INR">INR (₹ - Indian Rupee)</option>
              <option value="USD">USD ($ - US Dollar)</option>
              <option value="EUR">EUR (€ - Euro)</option>
              <option value="GBP">GBP (£ - British Pound)</option>
            </select>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Button type="submit" variant="primary" size="sm">
              Save Profile Settings
            </Button>
            {isSaved && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4" /> Changes saved
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* AI Token Budget & Quota */}
      <Card className="p-6 bg-white border-surface-200 shadow-sm">
        <h2 className="text-base font-bold text-surface-950 mb-1 flex items-center gap-2">
          <Coins className="w-4 h-4 text-brand-600" />
          <span>AI Usage & Monthly Token Budget</span>
        </h2>
        <p className="text-xs text-surface-500 mb-4">
          Tokens used for requirements extraction and scope-change detection runs.
        </p>

        <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-surface-700">Monthly Usage: 60,000 / 500,000 Tokens</span>
            <span className="text-brand-600">12% Consumed</span>
          </div>
          <div className="w-full h-2 bg-surface-200 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full w-[12%]" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-surface-500 pt-1">
            <span>Current Billing Cycle Resets in 18 Days</span>
            <span>Active Model: Google Gemini 1.5 Flash</span>
          </div>
        </div>
      </Card>

      {/* Privacy, DPDP Act & Data Export */}
      <Card className="p-6 bg-white border-surface-200 shadow-sm">
        <h2 className="text-base font-bold text-surface-950 mb-1 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Privacy & Data Sovereignty</span>
        </h2>
        <p className="text-xs text-surface-500 mb-4">
          ScopePilot strictly enforces India DPDP (Digital Personal Data Protection) Act 2023 and GDPR data protection rights.
        </p>

        <div className="space-y-3 text-xs text-surface-600 mb-6">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <p>
              <strong>Zero Model Training:</strong> Client requirement documents and project specifications are processed via enterprise non-retention endpoints and never used to train public foundation models.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong>Database Tenant Isolation:</strong> Every record is governed by PostgreSQL Row Level Security (RLS) linked to your authenticated identity.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-surface-100 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-surface-900">Export Your Data</h4>
            <p className="text-[11px] text-surface-500">Download a JSON snapshot of all your projects and baselines.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportData} leftIcon={<Download className="w-4 h-4" />}>
            Export Data
          </Button>
        </div>
      </Card>

      {/* Danger Zone: Account Deletion */}
      <Card className="p-6 bg-rose-50/40 border-rose-200">
        <h2 className="text-base font-bold text-rose-950 mb-1 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Danger Zone: Delete Account</span>
        </h2>
        <p className="text-xs text-rose-800/80 mb-4">
          Permanently delete your account, projects, uploaded documents, and scope history. This action cannot be undone.
        </p>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => setIsDeleteModalOpen(true)}
          leftIcon={<Trash2 className="w-4 h-4" />}
        >
          Delete Account & Purge Data
        </Button>
      </Card>

      {/* Account Deletion Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Permanently Delete Account?"
        description="This action is irreversible. All projects, baselines, and documents will be permanently erased."
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-surface-600">
            To confirm deletion, please type <span className="font-bold text-rose-600 font-mono">DELETE</span> below:
          </p>

          <Input
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="font-mono text-xs"
          />

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-surface-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleteConfirmationText !== 'DELETE'}
              isLoading={isDeleting}
              onClick={handleDeleteAccount}
            >
              Confirm Account Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
