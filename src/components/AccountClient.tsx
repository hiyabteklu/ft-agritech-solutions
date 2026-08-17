'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import Navbar from '@/components/Navbar';

type Tab = 'overview' | 'orders' | 'requests';

type ProblemRow = {
  id: string;
  title: string;
  description: string;
  sector: string;
  created_at: string;
};

type CustomRow = {
  id: string;
  reason: string;
  parameters: string;
  contact: string;
  sector: string;
  created_at: string;
};

export default function AccountClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab: Tab =
    tabParam === 'orders' || tabParam === 'requests' ? tabParam : 'overview';

  const [user, setUser] = useState(null as User | null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(initialTab as Tab);
  const [problems, setProblems] = useState([] as ProblemRow[]);
  const [customs, setCustoms] = useState([] as CustomRow[]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.replace('/');
        return;
      }
      setUser(session.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace('/');
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (tabParam === 'orders' || tabParam === 'requests' || tabParam === null) {
      setTab(
        tabParam === 'orders' || tabParam === 'requests' ? tabParam : 'overview'
      );
    }
  }, [tabParam]);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;

    const load = async () => {
      setDataLoading(true);
      const [probRes, customRes] = await Promise.all([
        supabase
          .from('problems')
          .select('id, title, description, sector, created_at')
          .eq('user_email', user.email)
          .order('created_at', { ascending: false }),
        supabase
          .from('custom_requests')
          .select('id, reason, parameters, contact, sector, created_at')
          .eq('user_email', user.email)
          .order('created_at', { ascending: false }),
      ]);

      if (!cancelled) {
        setProblems((probRes.data as ProblemRow[]) || []);
        setCustoms((customRes.data as CustomRow[]) || []);
        setDataLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  const setTabAndUrl = (t: Tab) => {
    setTab(t);
    const q = t === 'overview' ? '/account' : '/account?tab=' + t;
    router.replace(q, { scroll: false });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-brand-dark text-white">
        <Navbar />
        <div className="flex items-center justify-center px-4 py-24">
          <p className="text-gray-400">Loading your account…</p>
        </div>
      </div>
    );
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'User';

  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Header card */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-brand-card">
          <div className="h-20 bg-gradient-to-r from-brand-green/30 via-brand-gold/10 to-transparent sm:h-24" />
          <div className="-mt-10 flex flex-col gap-4 px-5 pb-6 sm:flex-row sm:items-end sm:px-8">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-brand-card bg-gradient-to-br from-brand-green to-emerald-800 text-2xl font-bold shadow-lg">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{displayName}</h1>
              <p className="text-sm text-gray-400">{user.email}</p>
              <p className="mt-1 text-xs text-gray-500">Member since {memberSince}</p>
            </div>
            <Link
              href="/"
              className="rounded-full border border-white/15 px-4 py-2 text-center text-sm text-gray-300 transition hover:bg-white/5"
            >
              ← Back to portal
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto border-b border-white/10 pb-px">
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'orders', label: 'My Orders' },
              { id: 'requests', label: 'My Requests' },
            ] as { id: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTabAndUrl(t.id)}
              className={
                'shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition ' +
                (tab === t.id
                  ? 'border-brand-gold text-brand-gold'
                  : 'border-transparent text-gray-400 hover:text-white')
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid gap-4 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setTabAndUrl('orders')}
              className="rounded-2xl border border-white/10 bg-brand-card p-5 text-left transition hover:border-brand-green/40"
            >
              <div className="mb-3 text-2xl">📦</div>
              <h2 className="font-semibold text-white">My Orders</h2>
              <p className="mt-1 text-sm text-gray-400">
                Track equipment and deployment orders.
              </p>
              <p className="mt-3 text-xs text-brand-green">Coming online with procurement →</p>
            </button>

            <button
              type="button"
              onClick={() => setTabAndUrl('requests')}
              className="rounded-2xl border border-white/10 bg-brand-card p-5 text-left transition hover:border-brand-gold/40"
            >
              <div className="mb-3 text-2xl">📋</div>
              <h2 className="font-semibold text-white">My Requests</h2>
              <p className="mt-1 text-sm text-gray-400">
                Problems and custom R&D you submitted.
              </p>
              <p className="mt-3 text-xs text-brand-gold">
                {dataLoading
                  ? 'Loading…'
                  : problems.length + customs.length + ' submission(s)'}
              </p>
            </button>

            <div className="rounded-2xl border border-white/10 bg-brand-card p-5">
              <div className="mb-3 text-2xl">🌱</div>
              <h2 className="font-semibold text-white">Explore solutions</h2>
              <p className="mt-1 text-sm text-gray-400">
                Browse all seven agricultural sectors.
              </p>
              <Link
                href="/#solutions"
                className="mt-3 inline-block text-xs text-brand-green hover:underline"
              >
                Go to solutions →
              </Link>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="rounded-2xl border border-dashed border-white/15 bg-brand-card/50 px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl">
              📦
            </div>
            <h2 className="text-xl font-semibold text-white">No orders yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
              When the procurement gateway goes live, your equipment orders and deployment
              status will appear here.
            </p>
            <Link
              href="/#solutions"
              className="mt-6 inline-block rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Browse solutions
            </Link>
          </div>
        )}

        {tab === 'requests' && (
          <div className="space-y-6">
            {dataLoading ? (
              <p className="text-center text-gray-400">Loading your requests…</p>
            ) : problems.length === 0 && customs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-brand-card/50 px-6 py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-3xl">
                  📋
                </div>
                <h2 className="text-xl font-semibold text-white">No requests yet</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
                  Report a field problem or request custom R&D from any sector page. Your
                  submissions will show up here.
                </p>
                <Link
                  href="/#solutions"
                  className="mt-6 inline-block rounded-full bg-brand-gold px-5 py-2.5 text-sm font-semibold text-black transition hover:opacity-90"
                >
                  Explore sectors
                </Link>
              </div>
            ) : (
              <>
                {problems.length > 0 && (
                  <section>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-red-400">
                      Problems reported ({problems.length})
                    </h2>
                    <ul className="space-y-3">
                      {problems.map((p) => (
                        <li
                          key={p.id}
                          className="rounded-xl border border-white/10 border-l-4 border-l-red-500 bg-brand-card p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h3 className="font-semibold text-white">{p.title}</h3>
                            <span className="rounded bg-white/5 px-2 py-0.5 text-xs text-gray-400">
                              {p.sector}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-400">{p.description}</p>
                          <p className="mt-2 text-xs text-gray-600">
                            {new Date(p.created_at).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {customs.length > 0 && (
                  <section>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-gold">
                      Custom R&D requests ({customs.length})
                    </h2>
                    <ul className="space-y-3">
                      {customs.map((c) => (
                        <li
                          key={c.id}
                          className="rounded-xl border border-white/10 border-l-4 border-l-brand-gold bg-brand-card p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h3 className="font-semibold text-white">{c.sector}</h3>
                            <span className="text-xs text-gray-500">{c.contact}</span>
                          </div>
                          <p className="mt-1 text-sm text-gray-300">
                            <span className="text-gray-500">Why: </span>
                            {c.reason}
                          </p>
                          <p className="mt-1 text-sm text-gray-400">
                            <span className="text-gray-500">Params: </span>
                            {c.parameters}
                          </p>
                          <p className="mt-2 text-xs text-gray-600">
                            {new Date(c.created_at).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
