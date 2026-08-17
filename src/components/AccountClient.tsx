'use client';

import { useCallback, useEffect, useState } from 'react';
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
  sector: string | null;
  status: string | null;
  created_at: string;
};

type CustomRow = {
  id: string;
  reason: string;
  parameters: string;
  contact: string | null;
  sector: string | null;
  status: string | null;
  created_at: string;
};

type QuoteRow = {
  id: string;
  product_name: string;
  product_price: string | null;
  sector: string | null;
  quantity: string | null;
  notes: string | null;
  contact_phone: string | null;
  status: string | null;
  created_at: string;
};

type WithdrawTarget = {
  table: 'quote_requests' | 'problems' | 'custom_requests';
  id: string;
  label: string;
  title: string;
};

function statusColor(status: string | null | undefined) {
  const s = (status || 'pending').toLowerCase();
  if (s === 'resolved' || s === 'closed') return 'bg-brand-green/15 text-brand-green border-brand-green/30';
  if (s === 'contacted' || s === 'in_progress') return 'bg-blue-500/15 text-blue-400 border-blue-400/30';
  if (s === 'withdrawn') return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
  return 'bg-brand-gold/15 text-brand-gold border-brand-gold/30';
}

function statusLabel(status: string | null | undefined) {
  const s = (status || 'pending').toLowerCase().replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function canWithdraw(status: string | null | undefined) {
  const s = (status || 'pending').toLowerCase();
  return s === 'pending' || s === 'contacted';
}

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
  const [quotes, setQuotes] = useState([] as QuoteRow[]);
  const [dataLoading, setDataLoading] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [toast, setToast] = useState('');
  const [withdrawTarget, setWithdrawTarget] = useState(null as WithdrawTarget | null);

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
      setTab(tabParam === 'orders' || tabParam === 'requests' ? tabParam : 'overview');
    }
  }, [tabParam]);

  const load = useCallback(async () => {
    if (!user?.email) return;
    setDataLoading(true);
    const [probRes, customRes, quoteRes] = await Promise.all([
      supabase
        .from('problems')
        .select('id, title, description, sector, status, created_at')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false }),
      supabase
        .from('custom_requests')
        .select('id, reason, parameters, contact, sector, status, created_at')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false }),
      supabase
        .from('quote_requests')
        .select(
          'id, product_name, product_price, sector, quantity, notes, contact_phone, status, created_at'
        )
        .eq('user_email', user.email)
        .order('created_at', { ascending: false }),
    ]);

    setProblems((probRes.data as ProblemRow[]) || []);
    setCustoms((customRes.data as CustomRow[]) || []);
    setQuotes((quoteRes.data as QuoteRow[]) || []);
    setDataLoading(false);
  }, [user?.email]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const confirmWithdraw = async () => {
    if (!user?.email || !withdrawTarget) return;
    const { table, id } = withdrawTarget;
    setBusyId(id);

    const { error: updateErr } = await supabase
      .from(table)
      .update({ status: 'withdrawn' })
      .eq('id', id)
      .eq('user_email', user.email);

    if (updateErr) {
      const { error: delErr } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('user_email', user.email);

      setBusyId('');
      setWithdrawTarget(null);
      if (delErr) {
        setToast('Could not withdraw: ' + (delErr.message || updateErr.message));
        return;
      }
      setToast('Submission withdrawn');
      await load();
      return;
    }

    setBusyId('');
    setWithdrawTarget(null);
    setToast('Submission withdrawn');
    await load();
  };

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

  const activeQuotes = quotes.filter((q) => (q.status || '').toLowerCase() !== 'withdrawn');
  const activeProblems = problems.filter((p) => (p.status || '').toLowerCase() !== 'withdrawn');
  const activeCustoms = customs.filter((c) => (c.status || '').toLowerCase() !== 'withdrawn');

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      {toast ? (
        <div className="fixed bottom-4 left-1/2 z-[300] max-w-[90vw] -translate-x-1/2 rounded-full border border-brand-green/40 bg-brand-card px-5 py-3 text-sm font-medium text-brand-green shadow-xl">
          {toast}
        </div>
      ) : null}

      {withdrawTarget ? (
        <div
          className="fixed inset-0 z-[250] flex items-center justify-center p-4"
          style={{
            background: 'rgba(0,0,0,0.75)',
            paddingTop: 'max(16px, env(safe-area-inset-top))',
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          }}
          onClick={() => !busyId && setWithdrawTarget(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-red-500/40 bg-brand-card p-5 shadow-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-2xl">
              ⚠️
            </div>
            <h3 className="text-center text-lg font-bold text-white">Withdraw {withdrawTarget.label}?</h3>
            <p className="mt-2 text-center text-sm text-gray-400">
              <span className="font-medium text-gray-200">{withdrawTarget.title}</span>
              <br />
              It will be marked as withdrawn. Admins can still see it in history.
            </p>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                disabled={!!busyId}
                onClick={() => setWithdrawTarget(null)}
                className="min-h-[48px] flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!!busyId}
                onClick={confirmWithdraw}
                className="min-h-[48px] flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {busyId === withdrawTarget.id ? 'Withdrawing…' : 'Yes, withdraw'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-5xl animate-fade-up px-4 py-10 sm:px-6">
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
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={load}
                disabled={dataLoading}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-white/20 bg-white/5 px-5 py-2.5 text-base font-semibold text-gray-200 transition hover:bg-white/10 disabled:opacity-50"
              >
                {dataLoading ? 'Refreshing…' : 'Refresh status'}
              </button>
              <Link
                href="/"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border-2 border-white/20 bg-white/5 px-5 py-2.5 text-center text-base font-semibold text-gray-200 transition hover:bg-white/10 active:scale-[0.98]"
              >
                <span className="text-lg leading-none" aria-hidden>
                  ←
                </span>
                Back to portal
              </Link>
            </div>
          </div>
        </div>

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
                'min-h-[48px] shrink-0 border-b-2 px-5 py-3 text-base font-semibold transition ' +
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
              className="card-alive rounded-2xl border border-white/10 bg-brand-card p-5 text-left transition hover:border-brand-green/40"
            >
              <div className="mb-3 text-2xl">📦</div>
              <h2 className="font-semibold text-white">My Orders</h2>
              <p className="mt-1 text-sm text-gray-400">Quote requests and live status.</p>
              <p className="mt-3 text-sm font-medium text-brand-green">
                {dataLoading ? 'Loading…' : activeQuotes.length + ' active quote(s)'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setTabAndUrl('requests')}
              className="card-alive rounded-2xl border border-white/10 bg-brand-card p-5 text-left transition hover:border-brand-gold/40"
            >
              <div className="mb-3 text-2xl">📋</div>
              <h2 className="font-semibold text-white">My Requests</h2>
              <p className="mt-1 text-sm text-gray-400">Problems and custom R&D status.</p>
              <p className="mt-3 text-sm font-medium text-brand-gold">
                {dataLoading
                  ? 'Loading…'
                  : activeProblems.length + activeCustoms.length + ' active submission(s)'}
              </p>
            </button>

            <div className="card-alive rounded-2xl border border-white/10 bg-brand-card p-5">
              <div className="mb-3 text-2xl">🌱</div>
              <h2 className="font-semibold text-white">Explore solutions</h2>
              <p className="mt-1 text-sm text-gray-400">
                Browse all seven agricultural sectors.
              </p>
              <Link
                href="/#solutions"
                className="mt-4 inline-flex min-h-[40px] items-center text-sm font-semibold text-brand-green hover:underline"
              >
                Go to solutions →
              </Link>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div>
            <p className="mb-4 text-sm text-gray-400">
              Status updates when our team reviews your quote. You can withdraw while it is still
              pending or contacted.
            </p>
            {dataLoading ? (
              <p className="text-center text-gray-400">Loading quotes…</p>
            ) : quotes.length === 0 ? (
              <EmptyState
                icon="📦"
                title="No quote requests yet"
                text="Open a product and tap Configure & Order. Your requests and their status will appear here."
              />
            ) : (
              <ul className="space-y-3">
                {quotes.map((q) => (
                  <li
                    key={q.id}
                    className="rounded-xl border border-white/10 border-l-4 border-l-brand-green bg-brand-card p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-semibold text-white">{q.product_name}</h3>
                      <span
                        className={
                          'rounded-full border px-2.5 py-1 text-xs font-semibold ' +
                          statusColor(q.status)
                        }
                      >
                        {statusLabel(q.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-400">
                      {q.sector} · Qty {q.quantity || '1'}
                      {q.product_price ? ' · ' + q.product_price : ''}
                    </p>
                    {q.notes ? <p className="mt-1 text-sm text-gray-500">{q.notes}</p> : null}
                    <p className="mt-2 text-xs text-gray-600">
                      {new Date(q.created_at).toLocaleString()}
                      {q.contact_phone ? ' · ' + q.contact_phone : ''}
                    </p>
                    {canWithdraw(q.status) ? (
                      <button
                        type="button"
                        disabled={busyId === q.id}
                        onClick={() =>
                          setWithdrawTarget({
                            table: 'quote_requests',
                            id: q.id,
                            label: 'quote',
                            title: q.product_name,
                          })
                        }
                        className="mt-3 min-h-[40px] rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 disabled:opacity-50"
                      >
                        Withdraw request
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'requests' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-400">
              Track admin updates on your problems and custom R&D. Withdraw while status is pending
              or contacted.
            </p>
            {dataLoading ? (
              <p className="text-center text-gray-400">Loading your requests…</p>
            ) : problems.length === 0 && customs.length === 0 ? (
              <EmptyState
                icon="📋"
                title="No requests yet"
                text="Report a field problem or request custom R&D from any sector page."
              />
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
                            <span
                              className={
                                'rounded-full border px-2.5 py-1 text-xs font-semibold ' +
                                statusColor(p.status)
                              }
                            >
                              {statusLabel(p.status)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-400">{p.sector}</p>
                          <p className="mt-1 text-sm text-gray-300">{p.description}</p>
                          <p className="mt-2 text-xs text-gray-600">
                            {new Date(p.created_at).toLocaleString()}
                          </p>
                          {canWithdraw(p.status) ? (
                            <button
                              type="button"
                              disabled={busyId === p.id}
                              onClick={() =>
                                setWithdrawTarget({
                                  table: 'problems',
                                  id: p.id,
                                  label: 'problem report',
                                  title: p.title,
                                })
                              }
                              className="mt-3 min-h-[40px] rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 disabled:opacity-50"
                            >
                              Withdraw submission
                            </button>
                          ) : null}
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
                            <h3 className="font-semibold text-white">{c.sector || 'Custom R&D'}</h3>
                            <span
                              className={
                                'rounded-full border px-2.5 py-1 text-xs font-semibold ' +
                                statusColor(c.status)
                              }
                            >
                              {statusLabel(c.status)}
                            </span>
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
                          {canWithdraw(c.status) ? (
                            <button
                              type="button"
                              disabled={busyId === c.id}
                              onClick={() =>
                                setWithdrawTarget({
                                  table: 'custom_requests',
                                  id: c.id,
                                  label: 'R&D request',
                                  title: c.sector || 'Custom R&D',
                                })
                              }
                              className="mt-3 min-h-[40px] rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 disabled:opacity-50"
                            >
                              Withdraw submission
                            </button>
                          ) : null}
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

function EmptyState({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-brand-card/50 px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">
        {icon}
      </div>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">{text}</p>
      <Link
        href="/#solutions"
        className="mt-6 inline-flex min-h-[48px] items-center rounded-full bg-brand-green px-6 py-3 text-base font-bold text-black transition hover:opacity-90 active:scale-[0.98]"
      >
        Browse solutions
      </Link>
    </div>
  );
}
