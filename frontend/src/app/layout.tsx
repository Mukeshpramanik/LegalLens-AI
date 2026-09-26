import type { Metadata } from 'next';
import './globals.css';
import { LEGAL_DISCLAIMER } from '../shared/constants';

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

        {/* Global Header has been moved to dashboard/layout.tsx so it doesn't show on the login page */}
        
        <main id="main-content" className="flex-1 w-full mx-auto">
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
