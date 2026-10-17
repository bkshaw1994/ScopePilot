'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error in production
    console.error('Unhandled ScopePilot Error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold text-surface-950">Something went wrong</h2>
      <p className="mt-1 text-xs text-surface-500 max-w-sm">
        An error occurred while processing this request. Your baseline scope data remains protected.
      </p>
      <Button
        variant="primary"
        size="sm"
        onClick={() => reset()}
        className="mt-4"
        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
      >
        Try Again
      </Button>
    </div>
  );
}
