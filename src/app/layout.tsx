import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'ScopePilot - AI Scope Creep Detection & Baseline Management SaaS',
  description:
    'Define the scope. Document the agreement. Detect changes before they become unpaid work. Built for freelance web developers and boutique software agencies.',
  keywords: [
    'scope creep detection',
    'freelance developer tool',
    'software proposal generator',
    'change order management',
    'client requirement baseline',
  ],
  authors: [{ name: 'ScopePilot Engineering Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-surface-50 text-surface-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
