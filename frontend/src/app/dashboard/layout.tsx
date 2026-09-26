'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, signOut } from '../../services/auth';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Loader2, LogOut } from 'lucide-react';
import { Logo } from '../../components/Logo';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        router.replace('/');
      }
      setIsChecking(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Stop rendering immediately, useEffect handles the redirect
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-slate-900 border-b border-slate-800 py-3 px-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />
          <nav aria-label="Main Navigation" className="flex items-center gap-6">
            <a href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Dashboard
            </a>
            <div className="flex items-center gap-4 border-l border-slate-700 pl-4">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-slate-700" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold uppercase">
                    {user.email ? user.email.charAt(0) : 'U'}
                  </div>
                )}
                <div className="hidden md:block">
                  <p className="text-xs text-white font-medium">{user.displayName || 'User'}</p>
                  <p className="text-[10px] text-slate-400">{user.email}</p>
                </div>
              </div>
              <button onClick={handleSignOut} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Sign Out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-6">
        {children}
      </div>
    </div>
  );
}
