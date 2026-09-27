'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithGoogle,
  getGoogleRedirectResult,
  getAuthErrorMessage,
  auth,
} from '../services/auth';
import { ShieldCheck, FileSearch, Scale, Loader2, Sparkles, AlertCircle, ExternalLink } from 'lucide-react';
import { Logo } from '../components/Logo';
import { onAuthStateChanged } from 'firebase/auth';

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // True while we're checking for an existing session OR resolving a redirect result.
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Track whether sign-in was triggered to prevent double-clicks.
  const isSigningIn = useRef(false);

  useEffect(() => {
    let unsubscribed = false;

    // 1. Resolve any pending redirect-based sign-in result FIRST.
    //    This runs after the page reloads following a signInWithRedirect() call.
    getGoogleRedirectResult()
      .then((user) => {
        if (user && !unsubscribed) {
          // Redirect result resolved – onAuthStateChanged will handle the redirect.
        }
      })
      .catch((err: any) => {
        if (!unsubscribed) {
          setError(getAuthErrorMessage(err));
          setIsAuthChecking(false);
        }
      });

    // 2. Listen for auth state. Redirect to dashboard if already signed in.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (unsubscribed) return;
      if (user) {
        router.replace('/dashboard');
      } else {
        setIsAuthChecking(false);
        setIsLoading(false); // Reset loading in case redirect flow returned without a user
      }
    });

    return () => {
      unsubscribed = true;
      unsubscribe();
    };
  }, [router]);

  const handleSignIn = async () => {
    // Prevent duplicate requests (double-click, keyboard spam, etc.)
    if (isSigningIn.current || isLoading) return;

    isSigningIn.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const user = await signInWithGoogle();

      if (user) {
        // Popup flow succeeded – onAuthStateChanged will handle the redirect.
        // Keep isLoading = true so the spinner persists while the redirect happens.
      } else {
        // Redirect flow initiated – browser will navigate away.
        // Show "Redirecting..." state. isLoading stays true.
        // The loading state will be reset naturally on the next page load.
      }
    } catch (err: any) {
      // Only reset loading on error; on success the page redirects.
      setError(getAuthErrorMessage(err));
      setIsLoading(false);
      isSigningIn.current = false;
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-500 text-sm">Checking authentication…</p>
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
              <div
                className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 space-y-2"
                role="alert"
                aria-live="assertive"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{error}</p>
                </div>
                {/* Surface direct Firebase Console link when it's a domain authorization error */}
                {(error.toLowerCase().includes('not authorized') || error.toLowerCase().includes('unauthorized-domain')) && (
                  <div className="ml-8 space-y-1">
                    <a
                      href="https://console.firebase.google.com/project/legallens-ai-6ac50/authentication/settings"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-red-600 underline underline-offset-2 font-medium hover:text-red-800"
                    >
                      Open Firebase Authorized Domains →
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <p className="text-xs text-red-500 font-mono bg-red-100 px-2 py-1 rounded">
                      Domain to add: <strong>{typeof window !== 'undefined' ? window.location.hostname : 'localhost'}</strong>
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              id="google-signin-btn"
              onClick={handleSignIn}
              disabled={isLoading}
              aria-label={isLoading ? 'Signing in with Google…' : 'Continue with Google'}
              aria-busy={isLoading}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl border border-slate-300 shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
              ) : (
                <GoogleIcon />
              )}
              <span>{isLoading ? 'Connecting…' : 'Continue with Google'}</span>
            </button>

            <p className="text-xs text-slate-400 text-center leading-relaxed">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
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

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}
