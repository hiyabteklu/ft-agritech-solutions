'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/admin';
import type { User } from '@supabase/supabase-js';
import Navbar from '@/components/Navbar';

type Tab = 'overview' | 'quotes' | 'problems' | 'custom' | 'contact';

type QuoteRow = {
  id: string;
  product_name: string;
  product_price: string | null;
  sector: string | null;
  quantity: string | null;
  notes: string | null;
  contact_phone: string | null;
  user_email: string | null;
  status: string | null;
  created_at: string;
};

type ProblemRow = {
  id: string;
  title: string;
  description: string;
  sector: string | null;
  user_email: string | null;
  status: string | null;
  created_at: string;
};

type CustomRow = {
  id: string;
  reason: string;
  parameters: string;
  contact: string | null;
  sector: string | null;
  user_email: string | null;
  status: string | null;
  created_at: string;
};

type ContactRow = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string | null;
  created_at: string;
};

const STATUS_OPTIONS = ['pending', 'contacted', 'in_progress', 'resolved', 'closed'] as const;

function statusColor(status: string | null | undefined) {
  const s = (status || 'pending').toLowerCase();
  if (s === 'resolved' || s === 'closed') return 'bg-brand-green/15 text-brand-green border-brand-green/30';
  if (s === 'contacted' || s === 'in_progress') return 'bg-blue-500/15 text-blue-400 border-blue-400/30';
  return 'bg-brand-gold/15 text-brand-gold border-brand-gold/30';
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function BarChart({
  data,
  color = '#10B981',
}: {
  data: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-500">No data yet</p>;
  }
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-xs text-gray-400 sm:w-28">{d.label}</span>
          <div className="h-7 flex-1 overflow-hidden rounded-lg bg-white/5">
            <div
              className="flex h-full items-center rounded-lg px-2 transition-all duration-500"
              style={{
                width: `${Math.max((d.value / max) * 100, d.value > 0 ? 8 : 0)}%`,
                backgroundColor: color,
              }}
            >
              {d.value > 0 ? (
                <span className="text-xs font-bold text-black">{d.value}</span>
              ) : null}
            </div>
          </div>
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

  const [quotes, setQuotes] = useState([] as QuoteRow[]);
  const [problems, setProblems] = useState([] as ProblemRow[]);
  const [customs, setCustoms] = useState([] as CustomRow[]);
  const [contacts, setContacts] = useState([] as ContactRow[]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [toast, setToast] = useState('');

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
    const [q, p, c, m] = await Promise.all([
      supabase
        .from('quote_requests')
        .select(
          'id, product_name, product_price, sector, quantity, notes, contact_phone, user_email, status, created_at'
        )
        .order('created_at', { ascending: false })
        .limit(200),
      supabase
        .from('problems')
        .select('id, title, description, sector, user_email, status, created_at')
        .order('created_at', { ascending: false })
        .limit(200),
      supabase
        .from('custom_requests')
        .select('id, reason, parameters, contact, sector, user_email, status, created_at')
        .order('created_at', { ascending: false })
        .limit(200),
      supabase
        .from('contact_messages')
        .select('id, name, email, subject, message, status, created_at')
        .order('created_at', { ascending: false })
        .limit(200),
    ]);

    const errs = [q.error, p.error, c.error, m.error].filter(Boolean);
    if (errs.length) {
      setError(errs.map((e) => e!.message).join(' · '));
    }

    setQuotes((q.data as QuoteRow[]) || []);
    setProblems((p.data as ProblemRow[]) || []);
    setCustoms((c.data as CustomRow[]) || []);
    setContacts((m.data as ContactRow[]) || []);
    setDataLoading(false);
  }, []);

  useEffect(() => {
    if (user) loadAll();
  }, [user, loadAll]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const updateStatus = async (
    table: 'quote_requests' | 'problems' | 'custom_requests' | 'contact_messages',
    id: string,
    status: string
  ) => {
    setUpdatingId(id);
    const { error: err } = await supabase.from(table).update({ status }).eq('id', id);
    setUpdatingId('');
    if (err) {
      setToast('Update failed: ' + err.message);
      return;
    }
    setToast('Status updated to ' + status);
    await loadAll();
  };

  const sectorCounts = useMemo(() => {
    const map: Record<string, number> = {};
    const bump = (s: string | null | undefined) => {
      const key = s?.trim() || 'Unknown';
      map[key] = (map[key] || 0) + 1;
    };
    quotes.forEach((r) => bump(r.sector));
    problems.forEach((r) => bump(r.sector));
    customs.forEach((r) => bump(r.sector));
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [quotes, problems, customs]);

  const quoteStatusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    quotes.forEach((r) => {
      const s = (r.status || 'pending').toLowerCase();
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [quotes]);

  const pendingQuotes = quotes.filter(
    (q) => !q.status || q.status.toLowerCase() === 'pending'
  ).length;
  const pendingProblems = problems.filter(
    (p) => !p.status || p.status.toLowerCase() === 'pending'
  ).length;
  const pendingCustom = customs.filter(
    (c) => !c.status || c.status.toLowerCase() === 'pending'
  ).length;

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

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      {toast ? (
        <div className="fixed bottom-4 left-1/2 z-[300] max-w-[90vw] -translate-x-1/2 rounded-full border border-brand-green/40 bg-brand-card px-5 py-3 text-sm font-medium text-brand-green shadow-xl">
          {toast}
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin dashboard</h1>
            <p className="mt-1 text-sm text-gray-400">
              Live submissions · signed in as {user.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadAll}
              disabled={dataLoading}
              className="min-h-[44px] rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-white/10 disabled:opacity-50"
            >
              {dataLoading ? 'Refreshing…' : 'Refresh'}
            </button>
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
            >
              ← Portal
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-brand-gold/30 bg-brand-gold/10 p-4 text-sm text-brand-gold">
            {error}
            <p className="mt-2 text-xs text-gray-400">
              If status updates fail, add a <code className="text-gray-300">status text</code> column
              on problems / custom_requests / contact_messages in Supabase.
            </p>
          </div>
        ) : null}

        {/* Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-white/10 pb-px">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
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

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-6 animate-fade-up">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Quote orders"
                value={quotes.length}
                sub={pendingQuotes + ' pending'}
                accent="text-brand-green"
                onClick={() => setTab('quotes')}
              />
              <StatCard
                label="Problems"
                value={problems.length}
                sub={pendingProblems + ' pending'}
                accent="text-red-400"
                onClick={() => setTab('problems')}
              />
              <StatCard
                label="Custom R&D"
                value={customs.length}
                sub={pendingCustom + ' pending'}
                accent="text-brand-gold"
                onClick={() => setTab('custom')}
              />
              <StatCard
                label="Contact msgs"
                value={contacts.length}
                sub="inbox"
                accent="text-blue-400"
                onClick={() => setTab('contact')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-brand-card p-5">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Activity by sector
                </h2>
                <BarChart data={sectorCounts} color="#10B981" />
              </div>
              <div className="rounded-2xl border border-white/10 bg-brand-card p-5">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Quote status breakdown
                </h2>
                <BarChart data={quoteStatusCounts} color="#D4AF37" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-brand-card p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                Recent activity
              </h2>
              <RecentFeed quotes={quotes} problems={problems} customs={customs} contacts={contacts} />
            </div>
          </div>
        )}

        {/* QUOTES / ORDERS */}
        {tab === 'quotes' && (
          <ListShell loading={dataLoading} empty={quotes.length === 0} emptyLabel="No quote requests yet">
            {quotes.map((row) => (
              <article
                key={row.id}
                className="rounded-2xl border border-white/10 border-l-4 border-l-brand-green bg-brand-card p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-white sm:text-lg">{row.product_name}</h3>
                    <p className="mt-0.5 text-sm text-gray-400">
                      {row.sector || '—'} · Qty {row.quantity || '1'}
                      {row.product_price ? ' · ' + row.product_price : ''}
                    </p>
                  </div>
                  <span
                    className={
                      'shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ' +
                      statusColor(row.status)
                    }
                  >
                    {row.status || 'pending'}
                  </span>
                </div>
                {row.notes ? <p className="mt-2 text-sm text-gray-300">{row.notes}</p> : null}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>{formatDate(row.created_at)}</span>
                  {row.user_email ? <span>{row.user_email}</span> : null}
                  {row.contact_phone ? <span>{row.contact_phone}</span> : null}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusSelect
                    value={row.status || 'pending'}
                    disabled={updatingId === row.id}
                    onChange={(s) => updateStatus('quote_requests', row.id, s)}
                  />
                  {row.contact_phone ? (
                    <a
                      href={'tel:' + row.contact_phone}
                      className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200"
                    >
                      Call
                    </a>
                  ) : null}
                  {row.contact_phone ? (
                    <a
                      href={
                        'https://wa.me/' +
                        row.contact_phone.replace(/[^0-9+]/g, '').replace(/^\+/, '')
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-brand-green/30 bg-brand-green/10 px-3 py-2 text-xs font-semibold text-brand-green"
                    >
                      WhatsApp
                    </a>
                  ) : null}
                  {row.user_email ? (
                    <a
                      href={'mailto:' + row.user_email}
                      className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200"
                    >
                      Email
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </ListShell>
        )}

        {/* PROBLEMS */}
        {tab === 'problems' && (
          <ListShell loading={dataLoading} empty={problems.length === 0} emptyLabel="No problems reported">
            {problems.map((row) => (
              <article
                key={row.id}
                className="rounded-2xl border border-white/10 border-l-4 border-l-red-500 bg-brand-card p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-white sm:text-lg">{row.title}</h3>
                    <p className="mt-0.5 text-sm text-gray-400">{row.sector || '—'}</p>
                  </div>
                  <span
                    className={
                      'shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ' +
                      statusColor(row.status)
                    }
                  >
                    {row.status || 'pending'}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">{row.description}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>{formatDate(row.created_at)}</span>
                  {row.user_email ? <span>{row.user_email}</span> : null}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusSelect
                    value={row.status || 'pending'}
                    disabled={updatingId === row.id}
                    onChange={(s) => updateStatus('problems', row.id, s)}
                  />
                  {row.user_email ? (
                    <a
                      href={'mailto:' + row.user_email + '?subject=Re: ' + encodeURIComponent(row.title)}
                      className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200"
                    >
                      Email customer
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </ListShell>
        )}

        {/* CUSTOM R&D */}
        {tab === 'custom' && (
          <ListShell loading={dataLoading} empty={customs.length === 0} emptyLabel="No custom R&D requests">
            {customs.map((row) => (
              <article
                key={row.id}
                className="rounded-2xl border border-white/10 border-l-4 border-l-brand-gold bg-brand-card p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-white sm:text-lg">
                      {row.sector || 'Custom R&D'}
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-400">{row.contact || row.user_email || '—'}</p>
                  </div>
                  <span
                    className={
                      'shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ' +
                      statusColor(row.status)
                    }
                  >
                    {row.status || 'pending'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-300">
                  <span className="text-gray-500">Why: </span>
                  {row.reason}
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  <span className="text-gray-500">Params: </span>
                  {row.parameters}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>{formatDate(row.created_at)}</span>
                  {row.user_email ? <span>{row.user_email}</span> : null}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusSelect
                    value={row.status || 'pending'}
                    disabled={updatingId === row.id}
                    onChange={(s) => updateStatus('custom_requests', row.id, s)}
                  />
                  {row.contact || row.user_email ? (
                    <a
                      href={'mailto:' + (row.user_email || row.contact)}
                      className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200"
                    >
                      Email
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </ListShell>
        )}

        {/* CONTACT */}
        {tab === 'contact' && (
          <ListShell loading={dataLoading} empty={contacts.length === 0} emptyLabel="No contact messages">
            {contacts.map((row) => (
              <article
                key={row.id}
                className="rounded-2xl border border-white/10 border-l-4 border-l-blue-400 bg-brand-card p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-white sm:text-lg">{row.name}</h3>
                    <p className="mt-0.5 text-sm text-gray-400">{row.email}</p>
                    {row.subject ? (
                      <p className="mt-1 text-sm font-medium text-blue-300">{row.subject}</p>
                    ) : null}
                  </div>
                  <span
                    className={
                      'shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ' +
                      statusColor(row.status)
                    }
                  >
                    {row.status || 'pending'}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">{row.message}</p>
                <p className="mt-3 text-xs text-gray-500">{formatDate(row.created_at)}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusSelect
                    value={row.status || 'pending'}
                    disabled={updatingId === row.id}
                    onChange={(s) => updateStatus('contact_messages', row.id, s)}
                  />
                  <a
                    href={
                      'mailto:' +
                      row.email +
                      (row.subject ? '?subject=Re: ' + encodeURIComponent(row.subject) : '')
                    }
                    className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200"
                  >
                    Reply by email
                  </a>
                </div>
              </article>
            ))}
          </ListShell>
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

function StatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (s: string) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[36px] rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs font-medium text-white outline-none focus:border-brand-gold disabled:opacity-50"
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s.replace('_', ' ')}
        </option>
      ))}
    </select>
  );
}

function ListShell({
  loading,
  empty,
  emptyLabel,
  children,
}: {
  loading: boolean;
  empty: boolean;
  emptyLabel: string;
  children: React.ReactNode;
}) {
  if (loading) {
    return <p className="py-16 text-center text-gray-400">Loading…</p>;
  }
  if (empty) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
        <p className="text-gray-500">{emptyLabel}</p>
      </div>
    );
  }
  return <div className="space-y-3 animate-fade-up">{children}</div>;
}

function RecentFeed({
  quotes,
  problems,
  customs,
  contacts,
}: {
  quotes: QuoteRow[];
  problems: ProblemRow[];
  customs: CustomRow[];
  contacts: ContactRow[];
}) {
  type Item = { id: string; kind: string; title: string; at: string; color: string };
  const items: Item[] = [
    ...quotes.slice(0, 5).map((r) => ({
      id: 'q-' + r.id,
      kind: 'Order',
      title: r.product_name,
      at: r.created_at,
      color: 'text-brand-green',
    })),
    ...problems.slice(0, 5).map((r) => ({
      id: 'p-' + r.id,
      kind: 'Problem',
      title: r.title,
      at: r.created_at,
      color: 'text-red-400',
    })),
    ...customs.slice(0, 5).map((r) => ({
      id: 'c-' + r.id,
      kind: 'R&D',
      title: r.sector || 'Custom request',
      at: r.created_at,
      color: 'text-brand-gold',
    })),
    ...contacts.slice(0, 5).map((r) => ({
      id: 'm-' + r.id,
      kind: 'Contact',
      title: r.subject || r.name,
      at: r.created_at,
      color: 'text-blue-400',
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 10);

  if (items.length === 0) {
    return <p className="text-sm text-gray-500">No submissions yet.</p>;
  }

  return (
    <ul className="divide-y divide-white/5">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
          <div className="min-w-0">
            <span className={'mr-2 text-xs font-semibold ' + item.color}>{item.kind}</span>
            <span className="text-sm text-gray-200">{item.title}</span>
          </div>
          <span className="shrink-0 text-xs text-gray-600">{formatDate(item.at)}</span>
        </li>
      ))}
    </ul>
  );
}
