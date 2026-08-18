'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/admin';
import type { User } from '@supabase/supabase-js';
import Navbar from '@/components/Navbar';

type Tab = 'overview' | 'quotes' | 'problems' | 'custom' | 'contact';

type AnyRow = Record<string, unknown> & {
  id: string | number;
  created_at?: string;
  status?: string | null;
  sector?: string | null;
  user_email?: string | null;
};

const STATUS_OPTIONS = ['pending', 'contacted', 'in_progress', 'resolved', 'closed'] as const;

function statusColor(status: string | null | undefined) {
  const s = (status || 'pending').toLowerCase();
  if (s === 'resolved' || s === 'closed') return 'bg-brand-green/15 text-brand-green border-brand-green/30';
  if (s === 'contacted' || s === 'in_progress') return 'bg-blue-500/15 text-blue-400 border-blue-400/30';
  return 'bg-brand-gold/15 text-brand-gold border-brand-gold/30';
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function str(v: unknown) {
  if (v == null) return '';
  return String(v);
}

function downloadCsv(filename: string, rows: AnyRow[]) {
  if (!rows.length) return;
  const keys = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const lines = [keys.join(',')].concat(rows.map((r) => keys.map((k) => esc(r[k])).join(',')));
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function BarChart({ data, color = '#10B981' }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  if (!data.length) return <p className="py-6 text-center text-sm text-gray-500">No data yet</p>;
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-xs text-gray-400 sm:w-32" title={d.label}>
            {d.label}
          </span>
          <div className="h-7 flex-1 overflow-hidden rounded-lg bg-white/5">
            <div
              className="flex h-full min-w-0 items-center rounded-lg px-2 transition-all duration-500"
              style={{
                width: `${Math.max((d.value / max) * 100, d.value > 0 ? 10 : 0)}%`,
                backgroundColor: color,
              }}
            >
              {d.value > 0 ? <span className="text-xs font-bold text-black">{d.value}</span> : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DayBars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-36 items-end gap-1.5 sm:gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] font-semibold tabular-nums text-gray-400">{d.value || ''}</span>
          <div className="flex w-full flex-1 items-end justify-center">
            <div
              className="w-full max-w-[36px] rounded-t-md bg-gradient-to-t from-brand-green to-emerald-400 transition-all duration-500"
              style={{ height: `${Math.max((d.value / max) * 100, d.value > 0 ? 8 : 2)}%` }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
          <span className="text-[10px] text-gray-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminClient() {
  const router = useRouter();
  const [user, setUser] = useState(null as User | null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview' as Tab);

  const [quotes, setQuotes] = useState([] as AnyRow[]);
  const [problems, setProblems] = useState([] as AnyRow[]);
  const [customs, setCustoms] = useState([] as AnyRow[]);
  const [contacts, setContacts] = useState([] as AnyRow[]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');
  const [tableErrors, setTableErrors] = useState({} as Record<string, string>);
  const [updatingId, setUpdatingId] = useState('');
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState('');
  const [noteDraft, setNoteDraft] = useState({} as Record<string, string>);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      if (!u || !isAdminEmail(u.email)) {
        router.replace('/');
        return;
      }
      setUser(u);
      setLoading(false);
    });
  }, [router]);

  const loadAll = useCallback(async () => {
    setDataLoading(true);
    setError('');
    setTableErrors({});

    const [q, p, c, m] = await Promise.all([
      supabase.from('quote_requests').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('problems').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('custom_requests').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(300),
    ]);

    const errs: Record<string, string> = {};
    if (q.error) errs.quotes = q.error.message;
    if (p.error) errs.problems = p.error.message;
    if (c.error) errs.custom = c.error.message;
    if (m.error) errs.contact = m.error.message;
    setTableErrors(errs);

    const allMsgs = Object.values(errs);
    if (allMsgs.length) setError(allMsgs.join(' · '));

    setQuotes((q.data as AnyRow[]) || []);
    setProblems((p.data as AnyRow[]) || []);
    setCustoms((c.data as AnyRow[]) || []);
    setContacts((m.data as AnyRow[]) || []);
    setDataLoading(false);
  }, []);

  useEffect(() => {
    if (user) loadAll();
  }, [user, loadAll]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const refreshSession = async () => {
    const { error: err } = await supabase.auth.refreshSession();
    if (err) {
      setToast('Session refresh failed — sign out and sign in again');
      return;
    }
    setToast('Session refreshed');
    await loadAll();
  };

  const updateField = async (
    table: 'quote_requests' | 'problems' | 'custom_requests' | 'contact_messages',
    id: string | number,
    patch: Record<string, unknown>
  ) => {
    setUpdatingId(String(id));
    const { error: err } = await supabase.from(table).update(patch).eq('id', id);
    setUpdatingId('');
    if (err) {
      setToast('Update failed: ' + err.message);
      return;
    }
    setToast('Saved');
    await loadAll();
  };

  const filterRows = (rows: AnyRow[]) => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const st = str(r.status || 'pending').toLowerCase();
      if (statusFilter !== 'all' && st !== statusFilter) return false;
      if (!q) return true;
      return JSON.stringify(r).toLowerCase().includes(q);
    });
  };

  const filteredQuotes = useMemo(() => filterRows(quotes), [quotes, search, statusFilter]);
  const filteredProblems = useMemo(() => filterRows(problems), [problems, search, statusFilter]);
  const filteredCustoms = useMemo(() => filterRows(customs), [customs, search, statusFilter]);
  const filteredContacts = useMemo(() => filterRows(contacts), [contacts, search, statusFilter]);

  const sectorCounts = useMemo(() => {
    const map: Record<string, number> = {};
    const bump = (s: unknown) => {
      const key = str(s).trim() || 'Unknown';
      map[key] = (map[key] || 0) + 1;
    };
    quotes.forEach((r) => bump(r.sector));
    problems.forEach((r) => bump(r.sector));
    customs.forEach((r) => bump(r.sector));
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
  }, [quotes, problems, customs]);

  const typeCounts = useMemo(
    () => [
      { label: 'Orders', value: quotes.length },
      { label: 'Problems', value: problems.length },
      { label: 'Custom R&D', value: customs.length },
      { label: 'Contact', value: contacts.length },
    ],
    [quotes, problems, customs, contacts]
  );

  const statusBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    [...quotes, ...problems, ...customs, ...contacts].forEach((r) => {
      const s = str(r.status || 'pending').toLowerCase();
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [quotes, problems, customs, contacts]);

  const last7Days = useMemo(() => {
    const days: { key: string; label: string; value: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      days.push({ key, label, value: 0 });
    }
    const map = Object.fromEntries(days.map((x) => [x.key, x]));
    const all = [...quotes, ...problems, ...customs, ...contacts];
    all.forEach((r) => {
      const iso = str(r.created_at);
      if (!iso) return;
      const key = iso.slice(0, 10);
      if (map[key]) map[key].value += 1;
    });
    return days.map(({ label, value }) => ({ label, value }));
  }, [quotes, problems, customs, contacts]);

  const pendingTotal =
    [...quotes, ...problems, ...customs, ...contacts].filter(
      (r) => !r.status || str(r.status).toLowerCase() === 'pending'
    ).length;

  const totalSubmissions = quotes.length + problems.length + customs.length + contacts.length;

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-brand-dark text-white">
        <Navbar />
        <p className="py-24 text-center text-gray-400">Checking admin access…</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'quotes', label: 'Orders', count: quotes.length },
    { id: 'problems', label: 'Problems', count: problems.length },
    { id: 'custom', label: 'Custom R&D', count: customs.length },
    { id: 'contact', label: 'Contact', count: contacts.length },
  ];

  const isJwtClock =
    error.toLowerCase().includes('jwt') ||
    error.toLowerCase().includes('issued at future') ||
    Object.values(tableErrors).some(
      (m) => m.toLowerCase().includes('jwt') || m.toLowerCase().includes('issued at future')
    );

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[10000] max-w-[90vw] -translate-x-1/2 rounded-full border border-brand-green/40 bg-brand-card px-5 py-3 text-sm font-medium text-brand-green shadow-2xl">
          {toast}
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold">Control center</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin dashboard</h1>
            <p className="mt-1 text-sm text-gray-400">
              {pendingTotal} pending · {totalSubmissions} total · {user.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/catalog"
              className="inline-flex min-h-[44px] items-center rounded-full border border-brand-green/40 bg-brand-green/15 px-4 py-2 text-sm font-semibold text-brand-green hover:bg-brand-green/25"
            >
              Catalog
            </Link>
            <button
              type="button"
              onClick={loadAll}
              disabled={dataLoading}
              className="min-h-[44px] rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-white/10 disabled:opacity-50"
            >
              {dataLoading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={refreshSession}
              className="min-h-[44px] rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-white/10"
            >
              Fix session
            </button>
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-white/10"
            >
              Portal
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-brand-gold/30 bg-brand-gold/10 p-4 text-sm text-brand-gold">
            <p className="font-semibold">{isJwtClock ? 'Phone clock / session issue' : 'Load error'}</p>
            <p className="mt-1 text-brand-gold/90">{error}</p>
            {isJwtClock ? (
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs text-gray-300">
                <li>Set phone Date & Time to Automatic.</li>
                <li>Tap Fix session above, or sign out and sign in again.</li>
                <li>Then tap Refresh.</li>
              </ol>
            ) : (
              <p className="mt-2 text-xs text-gray-400">
                Check Supabase Table Editor — if rows exist there but not here, RLS may block reads.
              </p>
            )}
          </div>
        ) : null}

        {tab !== 'overview' ? (
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email, product, sector, notes…"
              className="min-h-[44px] flex-1 rounded-xl border border-white/15 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-brand-gold"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-h-[44px] rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white outline-none focus:border-brand-gold"
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                const map: Record<Tab, AnyRow[]> = {
                  overview: [],
                  quotes: filteredQuotes,
                  problems: filteredProblems,
                  custom: filteredCustoms,
                  contact: filteredContacts,
                };
                downloadCsv(`ft-admin-${tab}.csv`, map[tab]);
              }}
              className="min-h-[44px] rounded-xl border border-brand-green/30 bg-brand-green/10 px-4 text-sm font-semibold text-brand-green"
            >
              Export CSV
            </button>
          </div>
        ) : null}

        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-white/10 pb-px">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setSearch('');
                setStatusFilter('all');
              }}
              className={
                'min-h-[44px] shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold transition sm:px-4 ' +
                (tab === t.id
                  ? 'border-brand-gold text-brand-gold'
                  : 'border-transparent text-gray-400 hover:text-white')
              }
            >
              {t.label}
              {typeof t.count === 'number' ? (
                <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-xs tabular-nums">
                  {t.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6 animate-fade-up">
            {pendingTotal > 0 ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-brand-gold/35 bg-gradient-to-r from-brand-gold/15 to-transparent p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-gold">
                    {pendingTotal} item{pendingTotal === 1 ? '' : 's'} awaiting action
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Review orders, problems, R&D, and contact messages marked pending.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTab('quotes');
                    setStatusFilter('pending');
                  }}
                  className="min-h-[44px] shrink-0 rounded-full bg-brand-gold px-5 py-2 text-sm font-bold text-black"
                >
                  Review pending
                </button>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Orders" value={quotes.length} sub="quote requests" accent="text-brand-green" onClick={() => setTab('quotes')} />
              <StatCard label="Problems" value={problems.length} sub={tableErrors.problems ? 'load error' : 'field reports'} accent="text-red-400" onClick={() => setTab('problems')} />
              <StatCard label="Custom R&D" value={customs.length} sub="consultation requests" accent="text-brand-gold" onClick={() => setTab('custom')} />
              <StatCard label="Contact" value={contacts.length} sub="inbox" accent="text-blue-400" onClick={() => setTab('contact')} />
            </div>

            <div className="grid gap-4 lg:grid-cols-5">
              <div className="rounded-2xl border border-white/10 bg-brand-card p-5 lg:col-span-3">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                    Activity · last 7 days
                  </h2>
                  <span className="text-xs text-gray-500">
                    {last7Days.reduce((a, b) => a + b.value, 0)} new
                  </span>
                </div>
                <DayBars data={last7Days} />
              </div>
              <Link
                href="/admin/catalog"
                className="flex flex-col justify-between rounded-2xl border border-brand-green/25 bg-gradient-to-br from-brand-green/15 to-brand-card p-5 transition hover:border-brand-green/50 lg:col-span-2"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-green">Products</p>
                  <h2 className="mt-1 text-xl font-bold text-white">Catalog manager</h2>
                  <p className="mt-2 text-sm text-gray-400">
                    Add, edit, or delete categories, field problems, and local / imported products.
                  </p>
                </div>
                <span className="mt-4 text-sm font-semibold text-brand-green">Open catalog →</span>
              </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-brand-card p-5">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">By type</h2>
                <BarChart data={typeCounts} color="#3B82F6" />
              </div>
              <div className="rounded-2xl border border-white/10 bg-brand-card p-5">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">By sector</h2>
                <BarChart data={sectorCounts} color="#10B981" />
              </div>
              <div className="rounded-2xl border border-white/10 bg-brand-card p-5">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">By status</h2>
                <BarChart data={statusBreakdown} color="#D4AF37" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-brand-card p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Recent activity</h2>
                <button
                  type="button"
                  onClick={() =>
                    downloadCsv('ft-admin-all.csv', [
                      ...quotes.map((r) => ({ ...r, _type: 'order' })),
                      ...problems.map((r) => ({ ...r, _type: 'problem' })),
                      ...customs.map((r) => ({ ...r, _type: 'custom' })),
                      ...contacts.map((r) => ({ ...r, _type: 'contact' })),
                    ])
                  }
                  className="text-xs font-semibold text-brand-green"
                >
                  Export all CSV
                </button>
              </div>
              <RecentFeed quotes={quotes} problems={problems} customs={customs} contacts={contacts} />
            </div>
          </div>
        )}

        {tab === 'quotes' && (
          <RowList
            loading={dataLoading}
            rows={filteredQuotes}
            empty="No quote requests match"
            accent="border-l-brand-green"
            title={(r) => str(r.product_name) || 'Order'}
            subtitle={(r) =>
              [str(r.sector), r.quantity ? 'Qty ' + str(r.quantity) : '', str(r.product_price)]
                .filter(Boolean)
                .join(' · ')
            }
            body={(r) => str(r.notes)}
            meta={(r) => [formatDate(str(r.created_at)), str(r.user_email), str(r.contact_phone)].filter(Boolean)}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            updatingId={updatingId}
            noteDraft={noteDraft}
            setNoteDraft={setNoteDraft}
            onStatus={(id, s) => updateField('quote_requests', id, { status: s })}
            onSaveNote={(id, note) => updateField('quote_requests', id, { admin_notes: note })}
            actions={(r) => (
              <>
                {r.contact_phone ? (
                  <a href={'tel:' + str(r.contact_phone)} className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold">
                    Call
                  </a>
                ) : null}
                {r.contact_phone ? (
                  <a
                    href={'https://wa.me/' + str(r.contact_phone).replace(/[^0-9+]/g, '').replace(/^\+/, '')}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-brand-green/30 bg-brand-green/10 px-3 py-2 text-xs font-semibold text-brand-green"
                  >
                    WhatsApp
                  </a>
                ) : null}
                {r.user_email ? (
                  <a href={'mailto:' + str(r.user_email)} className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold">
                    Email
                  </a>
                ) : null}
              </>
            )}
          />
        )}

        {tab === 'problems' && (
          <RowList
            loading={dataLoading}
            rows={filteredProblems}
            empty={tableErrors.problems ? 'Could not load problems: ' + tableErrors.problems : 'No problems match'}
            accent="border-l-red-500"
            title={(r) => str(r.title) || 'Problem'}
            subtitle={(r) => str(r.sector)}
            body={(r) => str(r.description)}
            meta={(r) => [formatDate(str(r.created_at)), str(r.user_email)].filter(Boolean)}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            updatingId={updatingId}
            noteDraft={noteDraft}
            setNoteDraft={setNoteDraft}
            onStatus={(id, s) => updateField('problems', id, { status: s })}
            onSaveNote={(id, note) => updateField('problems', id, { admin_notes: note })}
            actions={(r) =>
              r.user_email ? (
                <a
                  href={'mailto:' + str(r.user_email) + '?subject=Re: ' + encodeURIComponent(str(r.title))}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold"
                >
                  Email customer
                </a>
              ) : null
            }
          />
        )}

        {tab === 'custom' && (
          <RowList
            loading={dataLoading}
            rows={filteredCustoms}
            empty="No custom R&D match"
            accent="border-l-brand-gold"
            title={(r) => str(r.sector) || 'Custom R&D'}
            subtitle={(r) => str(r.contact) || str(r.user_email)}
            body={(r) => 'Why: ' + str(r.reason) + '\nParams: ' + str(r.parameters)}
            meta={(r) => [formatDate(str(r.created_at)), str(r.user_email)].filter(Boolean)}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            updatingId={updatingId}
            noteDraft={noteDraft}
            setNoteDraft={setNoteDraft}
            onStatus={(id, s) => updateField('custom_requests', id, { status: s })}
            onSaveNote={(id, note) => updateField('custom_requests', id, { admin_notes: note })}
            actions={(r) =>
              r.user_email || r.contact ? (
                <a
                  href={'mailto:' + str(r.user_email || r.contact)}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold"
                >
                  Email
                </a>
              ) : null
            }
          />
        )}

        {tab === 'contact' && (
          <RowList
            loading={dataLoading}
            rows={filteredContacts}
            empty="No contact messages match"
            accent="border-l-blue-400"
            title={(r) => str(r.name) || 'Message'}
            subtitle={(r) => [str(r.email), str(r.subject)].filter(Boolean).join(' · ')}
            body={(r) => str(r.message)}
            meta={(r) => [formatDate(str(r.created_at))].filter(Boolean)}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            updatingId={updatingId}
            noteDraft={noteDraft}
            setNoteDraft={setNoteDraft}
            onStatus={(id, s) => updateField('contact_messages', id, { status: s })}
            onSaveNote={(id, note) => updateField('contact_messages', id, { admin_notes: note })}
            actions={(r) => (
              <a
                href={
                  'mailto:' +
                  str(r.email) +
                  (r.subject ? '?subject=Re: ' + encodeURIComponent(str(r.subject)) : '')
                }
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold"
              >
                Reply by email
              </a>
            )}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
  onClick,
}: {
  label: string;
  value: number;
  sub: string;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-brand-card p-4 text-left transition hover:border-white/25 active:scale-[0.98]"
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p className={'mt-1 text-2xl font-bold tabular-nums sm:text-3xl ' + accent}>{value}</p>
      <p className="mt-1 text-xs text-gray-500">{sub}</p>
    </button>
  );
}

function RowList({
  loading,
  rows,
  empty,
  accent,
  title,
  subtitle,
  body,
  meta,
  actions,
  expandedId,
  setExpandedId,
  updatingId,
  noteDraft,
  setNoteDraft,
  onStatus,
  onSaveNote,
}: {
  loading: boolean;
  rows: AnyRow[];
  empty: string;
  accent: string;
  title: (r: AnyRow) => string;
  subtitle: (r: AnyRow) => string;
  body: (r: AnyRow) => string;
  meta: (r: AnyRow) => string[];
  actions?: (r: AnyRow) => React.ReactNode;
  expandedId: string;
  setExpandedId: (id: string) => void;
  updatingId: string;
  noteDraft: Record<string, string>;
  setNoteDraft: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onStatus: (id: string | number, s: string) => void;
  onSaveNote: (id: string | number, note: string) => void;
}) {
  if (loading) return <p className="py-16 text-center text-gray-400">Loading…</p>;
  if (!rows.length)
    return (
      <div className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center text-gray-500">
        {empty}
      </div>
    );

  return (
    <div className="space-y-3 animate-fade-up">
      {rows.map((row) => {
        const id = String(row.id);
        const open = expandedId === id;
        const noteVal = noteDraft[id] ?? str(row.admin_notes);
        return (
          <article
            key={id}
            className={'rounded-2xl border border-white/10 border-l-4 bg-brand-card p-4 sm:p-5 ' + accent}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setExpandedId(open ? '' : id)}>
                <h3 className="text-base font-semibold text-white sm:text-lg">{title(row)}</h3>
                <p className="mt-0.5 text-sm text-gray-400">{subtitle(row)}</p>
              </button>
              <span className={'shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ' + statusColor(str(row.status))}>
                {str(row.status) || 'pending'}
              </span>
            </div>
            {body(row) ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-300">{body(row)}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              {meta(row).map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select
                value={str(row.status) || 'pending'}
                disabled={updatingId === id}
                onChange={(e) => onStatus(row.id, e.target.value)}
                className="min-h-[36px] rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs font-medium text-white outline-none focus:border-brand-gold disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
              {actions?.(row)}
              <button
                type="button"
                onClick={() => setExpandedId(open ? '' : id)}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-300"
              >
                {open ? 'Hide notes' : 'Admin notes'}
              </button>
            </div>
            {open ? (
              <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                <textarea
                  value={noteVal}
                  onChange={(e) => setNoteDraft((d) => ({ ...d, [id]: e.target.value }))}
                  rows={3}
                  placeholder="Internal admin notes (customer won’t see these)…"
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-brand-gold"
                />
                <button
                  type="button"
                  disabled={updatingId === id}
                  onClick={() => onSaveNote(row.id, noteVal)}
                  className="rounded-lg bg-brand-gold px-4 py-2 text-xs font-bold text-black disabled:opacity-50"
                >
                  Save notes
                </button>
                <pre className="max-h-40 overflow-auto rounded-lg bg-black/40 p-2 text-[10px] text-gray-500">
                  {JSON.stringify(row, null, 2)}
                </pre>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function RecentFeed({
  quotes,
  problems,
  customs,
  contacts,
}: {
  quotes: AnyRow[];
  problems: AnyRow[];
  customs: AnyRow[];
  contacts: AnyRow[];
}) {
  type Item = { id: string; kind: string; title: string; at: string; color: string };
  const items: Item[] = [
    ...quotes.slice(0, 8).map((r) => ({
      id: 'q-' + r.id,
      kind: 'Order',
      title: str(r.product_name),
      at: str(r.created_at),
      color: 'text-brand-green',
    })),
    ...problems.slice(0, 8).map((r) => ({
      id: 'p-' + r.id,
      kind: 'Problem',
      title: str(r.title),
      at: str(r.created_at),
      color: 'text-red-400',
    })),
    ...customs.slice(0, 8).map((r) => ({
      id: 'c-' + r.id,
      kind: 'R&D',
      title: str(r.sector) || 'Custom',
      at: str(r.created_at),
      color: 'text-brand-gold',
    })),
    ...contacts.slice(0, 8).map((r) => ({
      id: 'm-' + r.id,
      kind: 'Contact',
      title: str(r.subject) || str(r.name),
      at: str(r.created_at),
      color: 'text-blue-400',
    })),
  ]
    .sort((a, b) => new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime())
    .slice(0, 12);

  if (!items.length) return <p className="text-sm text-gray-500">No submissions yet.</p>;

  return (
    <ul className="divide-y divide-white/5">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
          <div className="min-w-0">
            <span className={'mr-2 text-xs font-semibold ' + item.color}>{item.kind}</span>
            <span className="text-sm text-gray-200">{item.title || '—'}</span>
          </div>
          <span className="shrink-0 text-xs text-gray-600">{formatDate(item.at)}</span>
        </li>
      ))}
    </ul>
  );
}
