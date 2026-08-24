'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getAdminEmails, isAdminEmail } from '@/lib/admin';

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  last_seen_at: string | null;
  created_at: string | null;
};

type AdminAction = {
  id: string;
  admin_email: string;
  action_type: string;
  target_table: string | null;
  target_id: string | null;
  summary: string;
  details: Record<string, unknown> | null;
  created_at: string;
};

type SubmissionHint = {
  email: string;
  orders: number;
  problems: number;
  custom: number;
  lastAt: string;
};

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function isActiveRecently(iso?: string | null) {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  // Active in last 30 days
  return Date.now() - t < 30 * 24 * 60 * 60 * 1000;
}

export type PeopleTab = 'users' | 'admins' | 'history';

export default function AdminPeoplePanel({
  tab,
  search,
}: {
  tab: PeopleTab;
  search: string;
}) {
  const [profiles, setProfiles] = useState([] as Profile[]);
  const [actions, setActions] = useState([] as AdminAction[]);
  const [hints, setHints] = useState([] as SubmissionHint[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const adminEmails = useMemo(() => getAdminEmails(), []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    const [profRes, actRes, qRes, pRes, cRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, last_seen_at, created_at')
        .order('last_seen_at', { ascending: false })
        .limit(500),
      supabase
        .from('admin_actions')
        .select('id, admin_email, action_type, target_table, target_id, summary, details, created_at')
        .order('created_at', { ascending: false })
        .limit(200),
      supabase.from('quote_requests').select('user_email, created_at').limit(1000),
      supabase.from('problems').select('user_email, created_at').limit(1000),
      supabase.from('custom_requests').select('user_email, created_at').limit(1000),
    ]);

    const errs: string[] = [];
    if (profRes.error) errs.push('profiles: ' + profRes.error.message);
    if (actRes.error) errs.push('admin_actions: ' + actRes.error.message);
    if (errs.length) setError(errs.join(' · '));

    setProfiles((profRes.data as Profile[]) || []);
    setActions((actRes.data as AdminAction[]) || []);

    // Aggregate unique submitters as a fallback / enrichment
    const map: Record<string, SubmissionHint> = {};
    const bump = (email: unknown, created: unknown, kind: 'orders' | 'problems' | 'custom') => {
      const e = String(email || '')
        .trim()
        .toLowerCase();
      if (!e) return;
      if (!map[e]) map[e] = { email: e, orders: 0, problems: 0, custom: 0, lastAt: '' };
      map[e][kind] += 1;
      const at = String(created || '');
      if (at && (!map[e].lastAt || at > map[e].lastAt)) map[e].lastAt = at;
    };
    ((qRes.data as { user_email?: string; created_at?: string }[]) || []).forEach((r) =>
      bump(r.user_email, r.created_at, 'orders')
    );
    ((pRes.data as { user_email?: string; created_at?: string }[]) || []).forEach((r) =>
      bump(r.user_email, r.created_at, 'problems')
    );
    ((cRes.data as { user_email?: string; created_at?: string }[]) || []).forEach((r) =>
      bump(r.user_email, r.created_at, 'custom')
    );
    setHints(Object.values(map).sort((a, b) => (b.lastAt || '').localeCompare(a.lastAt || '')));

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const q = search.trim().toLowerCase();

  const usersView = useMemo(() => {
    // Prefer profiles; merge submission-only emails that never hit profiles yet
    const byEmail: Record<
      string,
      {
        email: string;
        name: string;
        avatar: string | null;
        lastSeen: string | null;
        joined: string | null;
        isAdmin: boolean;
        orders: number;
        problems: number;
        custom: number;
        source: 'profile' | 'submissions';
      }
    > = {};

    profiles.forEach((p) => {
      const email = (p.email || '').toLowerCase();
      if (!email) return;
      byEmail[email] = {
        email,
        name: p.full_name || email.split('@')[0],
        avatar: p.avatar_url,
        lastSeen: p.last_seen_at,
        joined: p.created_at,
        isAdmin: isAdminEmail(email),
        orders: 0,
        problems: 0,
        custom: 0,
        source: 'profile',
      };
    });

    hints.forEach((h) => {
      if (!byEmail[h.email]) {
        byEmail[h.email] = {
          email: h.email,
          name: h.email.split('@')[0],
          avatar: null,
          lastSeen: h.lastAt || null,
          joined: h.lastAt || null,
          isAdmin: isAdminEmail(h.email),
          orders: h.orders,
          problems: h.problems,
          custom: h.custom,
          source: 'submissions',
        };
      } else {
        byEmail[h.email].orders = h.orders;
        byEmail[h.email].problems = h.problems;
        byEmail[h.email].custom = h.custom;
      }
    });

    return Object.values(byEmail)
      .filter((u) => {
        if (!q) return true;
        return (
          u.email.includes(q) ||
          u.name.toLowerCase().includes(q) ||
          (u.isAdmin ? 'admin' : '').includes(q)
        );
      })
      .sort((a, b) => (b.lastSeen || '').localeCompare(a.lastSeen || ''));
  }, [profiles, hints, q]);

  const adminsView = useMemo(() => {
    const configured = adminEmails.length
      ? adminEmails
      : ['hiyabteklu720@gmail.com']; // matches client fallback in isAdminEmail

    return configured.map((email) => {
      const p = profiles.find((x) => (x.email || '').toLowerCase() === email);
      const actionCount = actions.filter((a) => a.admin_email.toLowerCase() === email).length;
      const lastAction = actions.find((a) => a.admin_email.toLowerCase() === email);
      return {
        email,
        name: p?.full_name || email.split('@')[0],
        avatar: p?.avatar_url || null,
        lastSeen: p?.last_seen_at || null,
        joined: p?.created_at || null,
        actionCount,
        lastActionAt: lastAction?.created_at || null,
        lastActionSummary: lastAction?.summary || null,
        active: isActiveRecently(p?.last_seen_at) || isActiveRecently(lastAction?.created_at),
      };
    });
  }, [adminEmails, profiles, actions]);

  const historyView = useMemo(() => {
    return actions.filter((a) => {
      if (!q) return true;
      const blob = JSON.stringify(a).toLowerCase();
      return blob.includes(q);
    });
  }, [actions, q]);

  if (loading) {
    return <p className="py-16 text-center text-gray-400">Loading people…</p>;
  }

  return (
    <div className="space-y-4 animate-fade-up">
      {error ? (
        <div className="rounded-xl border border-brand-gold/30 bg-brand-gold/10 p-4 text-sm text-brand-gold">
          <p className="font-semibold">Could not load some people data</p>
          <p className="mt-1 text-xs text-brand-gold/90">{error}</p>
          <p className="mt-2 text-xs text-gray-400">
            Run <code className="text-brand-gold">supabase-admin-users.sql</code> in the Supabase SQL
            Editor, then refresh. Until then, users still appear from submissions.
          </p>
        </div>
      ) : null}

      {tab === 'users' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-400">
              {usersView.length} registered / known user{usersView.length === 1 ? '' : 's'}
              {profiles.length === 0 ? ' (from submissions until profiles table is live)' : ''}
            </p>
            <button
              type="button"
              onClick={load}
              className="text-xs font-semibold text-brand-green hover:underline"
            >
              Refresh list
            </button>
          </div>
          {!usersView.length ? (
            <EmptyBox text="No users found yet. They appear after Google sign-in or a submission." />
          ) : (
            <ul className="space-y-2">
              {usersView.map((u) => (
                <li
                  key={u.email}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-brand-card p-4"
                >
                  <Avatar name={u.name} url={u.avatar} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-white">{u.name}</p>
                      {u.isAdmin ? (
                        <span className="rounded-full border border-purple-400/40 bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-300">
                          Admin
                        </span>
                      ) : null}
                      {u.source === 'submissions' ? (
                        <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-gray-400">
                          via submissions
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-sm text-gray-400">{u.email}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Last seen {formatDate(u.lastSeen)} · Joined {formatDate(u.joined)}
                    </p>
                  </div>
                  <div className="flex gap-3 text-center text-xs tabular-nums">
                    <Metric label="Orders" value={u.orders} />
                    <Metric label="Problems" value={u.problems} />
                    <Metric label="R&D" value={u.custom} />
                  </div>
                  {u.email ? (
                    <a
                      href={'mailto:' + u.email}
                      className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200"
                    >
                      Email
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {tab === 'admins' && (
        <>
          <p className="text-sm text-gray-400">
            Admins are configured via <code className="text-brand-gold">NEXT_PUBLIC_ADMIN_EMAILS</code>
            . “Active” means seen or took an action in the last 30 days.
          </p>
          <ul className="space-y-2">
            {adminsView.map((a) => (
              <li
                key={a.email}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-purple-500/20 bg-brand-card p-4"
              >
                <Avatar name={a.name} url={a.avatar} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-white">{a.name}</p>
                    <span
                      className={
                        'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ' +
                        (a.active
                          ? 'border-brand-green/40 bg-brand-green/15 text-brand-green'
                          : 'border-white/15 bg-white/5 text-gray-400')
                      }
                    >
                      {a.active ? 'Active' : 'Configured'}
                    </span>
                  </div>
                  <p className="truncate text-sm text-gray-400">{a.email}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Last seen {formatDate(a.lastSeen)} · {a.actionCount} logged action
                    {a.actionCount === 1 ? '' : 's'}
                  </p>
                  {a.lastActionSummary ? (
                    <p className="mt-1 text-xs text-gray-400">
                      Latest: {a.lastActionSummary}{' '}
                      <span className="text-gray-600">({formatDate(a.lastActionAt)})</span>
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === 'history' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-400">
              {historyView.length} action{historyView.length === 1 ? '' : 's'} (status changes, notes,
              etc.)
            </p>
            <button
              type="button"
              onClick={load}
              className="text-xs font-semibold text-brand-green hover:underline"
            >
              Refresh
            </button>
          </div>
          {!historyView.length ? (
            <EmptyBox text="No admin actions logged yet. Updating a status or note will appear here." />
          ) : (
            <ul className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-brand-card">
              {historyView.map((a) => (
                <li key={a.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-200">{a.summary}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      <span className="font-medium text-purple-300">{a.admin_email}</span>
                      {a.target_table ? (
                        <>
                          {' · '}
                          <span className="text-gray-400">{a.target_table}</span>
                          {a.target_id ? (
                            <span className="text-gray-600"> #{String(a.target_id).slice(0, 8)}</span>
                          ) : null}
                        </>
                      ) : null}
                      {' · '}
                      <span className="uppercase tracking-wide text-gray-600">{a.action_type}</span>
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-600">{formatDate(a.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-green to-emerald-800 text-sm font-bold text-white">
      {url ? <img src={url} alt={name} className="h-full w-full object-cover" /> : name.charAt(0).toUpperCase()}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-sm font-semibold text-white">{value}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center text-gray-500">
      {text}
    </div>
  );
}
