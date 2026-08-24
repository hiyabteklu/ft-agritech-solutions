'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/admin';
import { upsertProfile } from '@/lib/profiles';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null as User | null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef(null as HTMLDivElement | null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      setLoading(false);
      if (u) void upsertProfile(u);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) void upsertProfile(u);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const emitSearch = (value: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ft-search', { detail: { query: value } }));
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (pathname === '/') {
      emitSearch(value);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pathname !== '/') {
      router.push('/#solutions');
      setTimeout(() => emitSearch(search), 300);
    } else {
      emitSearch(search);
      document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User';

  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  const admin = isAdminEmail(user?.email);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
          <img
            src="/ftagritech1.jpg"
            alt="FT Agri-Tech"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-green/30"
          />
          <span className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            FT-Agri-Tech
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search solutions..."
              className="w-44 rounded-full border border-white/15 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder-gray-400 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/40 md:w-56"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              🔍
            </span>
          </form>

          <Link
            href="/contact"
            className="hidden min-h-[40px] items-center rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10 md:inline-flex"
          >
            Contact
          </Link>

          {!loading && !user && (
            <button
              type="button"
              onClick={handleLogin}
              className="min-h-[44px] rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 active:scale-[0.98]"
            >
              Register / Log In
            </button>
          )}

          {!loading && user && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex min-h-[44px] items-center gap-2 rounded-full border border-brand-green/40 bg-brand-green/10 py-1.5 pl-1.5 pr-3 transition hover:bg-brand-green/20 active:scale-[0.98] sm:pr-3.5"
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-green to-emerald-700 text-sm font-bold text-white">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden flex-col leading-tight sm:flex">
                  <span className="text-sm font-semibold text-brand-green">{displayName}</span>
                  <span className="max-w-[120px] truncate text-xs text-gray-400">{user.email}</span>
                </div>
                <span
                  className={
                    'ml-0.5 text-xs text-brand-green transition ' + (menuOpen ? 'rotate-180' : '')
                  }
                >
                  ▼
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-72 animate-scale-in overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black/60">
                  <div className="border-b border-white/10 bg-gradient-to-r from-brand-green/10 to-transparent px-4 py-3.5">
                    <p className="text-base font-semibold text-white">{displayName}</p>
                    <p className="truncate text-sm text-gray-400">{user.email}</p>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/account"
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-[52px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-200 transition hover:bg-white/5"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gold/15 text-base">
                        👤
                      </span>
                      <span>
                        <span className="block font-medium text-white">My Account</span>
                        <span className="block text-xs text-gray-500">Profile & overview</span>
                      </span>
                    </Link>

                    <Link
                      href="/account?tab=orders"
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-[52px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-200 transition hover:bg-white/5"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-base">
                        📦
                      </span>
                      <span>
                        <span className="block font-medium text-white">My Orders</span>
                        <span className="block text-xs text-gray-500">Quotes & requests</span>
                      </span>
                    </Link>

                    <Link
                      href="/account?tab=requests"
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-[52px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-200 transition hover:bg-white/5"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/15 text-base">
                        📋
                      </span>
                      <span>
                        <span className="block font-medium text-white">My Requests</span>
                        <span className="block text-xs text-gray-500">Problems & custom R&D</span>
                      </span>
                    </Link>

                    <Link
                      href="/contact"
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-[52px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-200 transition hover:bg-white/5"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-base">
                        ✉️
                      </span>
                      <span>
                        <span className="block font-medium text-white">Contact</span>
                        <span className="block text-xs text-gray-500">Reach the team</span>
                      </span>
                    </Link>

                    {admin && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-[52px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-200 transition hover:bg-white/5"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/15 text-base">
                          🛡️
                        </span>
                        <span>
                          <span className="block font-medium text-white">Admin</span>
                          <span className="block text-xs text-gray-500">All submissions</span>
                        </span>
                      </Link>
                    )}

                    {admin && (
                      <Link
                        href="/admin/catalog"
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-[52px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-200 transition hover:bg-white/5"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green/15 text-base">
                          📦
                        </span>
                        <span>
                          <span className="block font-medium text-white">Catalog</span>
                          <span className="block text-xs text-gray-500">Products & categories</span>
                        </span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-white/10 p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex min-h-[52px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 active:scale-[0.98]"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-base">
                        🚪
                      </span>
                      <span className="font-semibold">Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
