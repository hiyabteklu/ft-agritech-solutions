'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User';

  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img
            src="/ftagritech1.jpg"
            alt="FT Agri-Tech"
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="text-lg font-semibold tracking-tight text-white">
            FT-Agri-Tech
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Search - hidden on very small screens */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search solutions..."
              className="w-44 rounded-full border border-white/15 bg-white/5 py-1.5 pl-9 pr-3 text-sm text-white placeholder-gray-400 outline-none transition focus:border-brand-green focus:ring-1 focus:ring-brand-green md:w-56"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              🔍
            </span>
          </div>

          {/* User chip */}
          {user && (
            <div className="flex items-center gap-2 rounded-full border border-brand-green/40 bg-brand-green/10 py-1 pl-1 pr-3">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-green to-brand-green-dark text-sm font-bold text-white">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="hidden flex-col leading-tight sm:flex">
                <span className="text-xs font-semibold text-brand-green">{displayName}</span>
                <span className="max-w-[120px] truncate text-[10px] text-gray-400">{user.email}</span>
              </div>
            </div>
          )}

          {/* Auth button */}
          {!loading && (
            user ? (
              <button
                onClick={handleLogout}
                className="rounded-full bg-gradient-to-r from-brand-green to-brand-green-dark px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                Log Out
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Register / Log In
              </button>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
