import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface-50 text-center">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6 shadow-sm">
        <Compass className="w-8 h-8 stroke-[2]" />
      </div>
      <h1 className="text-4xl font-extrabold text-surface-950 tracking-tight">404 - Page Not Found</h1>
      <p className="mt-2 text-sm text-surface-500 max-w-md">
        The project, requirement, or scope comparison page you are looking for does not exist or has been archived.
      </p>
      <div className="mt-6">
        <Link href="/dashboard">
          <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
