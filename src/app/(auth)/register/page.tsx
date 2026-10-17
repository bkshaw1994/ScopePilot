'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Compass, Mail, Lock, User, Building, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/db/client';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>('INR');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!email || !password || !fullName) {
        throw new Error('Please fill in all required fields.');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
        sessionStorage.setItem('mock_user_email', email);
        sessionStorage.setItem('mock_user_name', fullName);
        router.push('/dashboard');
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
            default_currency: currency,
          },
        },
      });

      if (error) {
        throw error;
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to create account. Please try again.');
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
          Create your developer account
        </h2>
        <p className="mt-1 text-sm text-surface-500">
          Start protecting your project scope in under 2 minutes
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-lg border-surface-200">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Aarav Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Work Email <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="aarav@agency.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Company / Agency Name <span className="text-surface-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="text"
                  placeholder="Sharma Digital Studio"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  leftIcon={<Building className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Default Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'INR' | 'USD' | 'EUR' | 'GBP')}
                  className="flex h-10 w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Create Free Account
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t border-surface-100 py-4 text-xs text-surface-500">
            <span>Already have an account?</span>{' '}
            <Link
              href="/login"
              className="font-semibold text-brand-600 hover:underline ml-1"
            >
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
