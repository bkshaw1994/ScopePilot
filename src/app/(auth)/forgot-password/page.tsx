'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Compass, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/db/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!email) {
        throw new Error('Please enter your email address.');
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
        setIsSuccess(true);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setIsSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to send reset link. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-surface-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-surface-950">
            ScopePilot
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-surface-950 tracking-tight">
          Reset your password
        </h2>
        <p className="mt-1 text-sm text-surface-500">
          We&apos;ll send a secure password reset link to your email
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-lg border-surface-200">
          <CardContent className="pt-6">
            {isSuccess ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-surface-900 text-base">Check your inbox</h3>
                <p className="text-xs text-surface-600">
                  If an account exists for <span className="font-medium text-surface-900">{email}</span>, you will receive password reset instructions.
                </p>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="mt-4">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="developer@agency.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4" />}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  isLoading={isLoading}
                >
                  Send Reset Link
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="justify-center border-t border-surface-100 py-4 text-xs text-surface-500">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-medium text-surface-600 hover:text-surface-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to sign in</span>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
