'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle, auth } from '../services/auth';
import { ShieldCheck, FileSearch, Scale, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Logo } from '../components/Logo';
import { onAuthStateChanged } from 'firebase/auth';

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/dashboard');
      } else {
        setIsAuthChecking(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // Wait for onAuthStateChanged to redirect
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for OAuth. Check Firebase Console.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
      setIsLoading(false);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Left Column - Branding & Value Prop */}
      <div className="w-full md:w-5/12 bg-slate-900 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-cyan-500 rounded-full blur-[120px] opacity-20 pointer-events-none" />

        <div className="relative z-10">
          <Logo />

          <div className="mt-24 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-full text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Grounded AI Assistant
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Understand Legal Documents with AI
            </h1>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
              Extract key clauses, detect risks, map obligations, and compare contracts instantly using verifiable, source-attributed AI.
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-16 space-y-6">
          <FeatureItem
            icon={<ShieldCheck className="w-5 h-5 text-cyan-400" />}
            title="100% Grounded AI"
            description="Every extraction is explicitly cited from your document."
          />
          <FeatureItem
            icon={<FileSearch className="w-5 h-5 text-cyan-400" />}
            title="Risk Mapping"
            description="Identify indemnities, liabilities, and hidden obligations."
          />
          <FeatureItem
            icon={<Scale className="w-5 h-5 text-cyan-400" />}
            title="Contract Comparison"
            description="Compare revisions side-by-side to highlight modifications."
          />
        </div>
      </div>

      {/* Right Column - Login */}
      <div className="w-full md:w-7/12 flex items-center justify-center p-8 md:p-12 bg-slate-50 relative">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome to LegalLens AI</h2>
            <p className="mt-2 text-slate-500">Sign in to access your secure document workspace</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-3 border border-red-100" role="alert">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl border border-slate-300 shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>
          </div>
          <p className="text-center text-xs text-slate-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 bg-slate-800 p-2 rounded-lg shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-white">{title}</h4>
        <p className="text-sm text-slate-400 mt-1">{description}</p>
      </div>
    </div>
  );
}
