import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RoleFit AI — Transparent Resume-to-Job Matching',
  description:
    'Explainable 50/35/15 scoring breakdown, actionable skill gap analysis, and grounded CV adaptation tips for early-career developers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        {children}
      </body>
    </html>
  );
}
