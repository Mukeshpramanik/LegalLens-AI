import type { Metadata } from 'next';
import './globals.css';
import { Logo } from "../components/Logo";

import { LEGAL_DISCLAIMER } from '../../../shared/constants';

export const metadata: Metadata = {
  title: 'LegalLens AI — Grounded GenAI Legal Assistance',
  description: 'Understand, simplify, compare, and navigate legal documents with grounded AI analysis.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>

        <header className="bg-slate-900 border-b border-slate-800 py-3 px-6 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Logo />
            <nav aria-label="Main Navigation" className="flex items-center gap-6">
              <a href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Dashboard
              </a>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold">
                U
              </div>
            </nav>
          </div>
        </header>

        <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-6">
          {children}
        </main>

        <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 p-6 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="max-w-3xl text-center md:text-left text-slate-400 leading-relaxed">
              <strong className="text-slate-300">Notice:</strong> {LEGAL_DISCLAIMER}
            </p>
            <div className="text-slate-500 whitespace-nowrap">
              &copy; {new Date().getFullYear()} LegalLens AI. Hackathon Edition.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
