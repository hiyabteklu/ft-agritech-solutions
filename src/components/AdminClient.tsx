'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/admin';
import type { User } from '@supabase/supabase-js';
import Navbar from '@/components/Navbar';

type Tab = 'quotes' | 'problems' | 'custom' | 'contact';

export default function AdminClient() {
  const router = useRouter();
  const [user, setUser] = useState(null as User | null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('quotes' as Tab);
  const [rows, setRows] = useState([] as Record<string, unknown>[]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      setDataLoading(true);
      setError('');
      let query;
      if (tab === 'quotes') {
        query = supabase
          .from('quote_requests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
      } else if (tab === 'problems') {
        query = supabase
          .from('problems')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
      } else if (tab === 'custom') {
        query = supabase
          .from('custom_requests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
      } else {
        query = supabase
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
      }

      const { data, error: err } = await query;
      if (cancelled) return;
      if (err) {
        setError(err.message);
        setRows([]);
      } else {
        setRows((data as Record<string, unknown>[]) || []);
      }
      setDataLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user, tab]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-brand-dark text-white">
        <Navbar />
        <p className="py-24 text-center text-gray-400">Checking access…</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'quotes', label: 'Quotes' },
    { id: 'problems', label: 'Problems' },
    { id: 'custom', label: 'Custom R&D' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Navbar />
      <div className="mx-auto max-w-5xl animate-fade-up px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Admin dashboard</h1>
            <p className="text-sm text-gray-400">Submissions from the live site</p>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full border-2 border-white/20 bg-white/5 px-5 py-2.5 text-base font-semibold text-gray-200 transition hover:bg-white/10 active:scale-[0.98]"
          >
            <span className="text-lg leading-none" aria-hidden>
              ←
            </span>
            Portal
          </Link>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto border-b border-white/10">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={
                'min-h-[48px] shrink-0 border-b-2 px-5 py-3 text-base font-semibold ' +
                (tab === t.id
                  ? 'border-brand-gold text-brand-gold'
                  : 'border-transparent text-gray-400 hover:text-white')
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="rounded-xl border border-brand-gold/30 bg-brand-gold/10 p-4 text-base text-brand-gold">
            {error}
            <p className="mt-2 text-sm text-gray-400">
              If this is an RLS error, run the admin policies in <code>supabase-tables.sql</code>.
            </p>
          </div>
        ) : null}

        {dataLoading ? (
          <p className="text-center text-gray-400">Loading…</p>
        ) : rows.length === 0 && !error ? (
          <p className="py-12 text-center text-gray-500">No rows in this table yet.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((row, i) => (
              <li
                key={String(row.id || i)}
                className="card-alive rounded-xl border border-white/10 bg-brand-card p-4 text-sm"
              >
                <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-gray-300">
                  {JSON.stringify(row, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
