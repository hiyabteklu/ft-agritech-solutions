'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/admin';
import { upsertProfile } from '@/lib/profiles';
import type { User } from '@supabase/supabase-js';
import Navbar from '@/components/Navbar';
import AdminPeoplePanel, { type PeopleTab } from '@/components/AdminPeoplePanel';

export default function AdminPeoplePageClient() {
  const router = useRouter();
  const [user, setUser] = useState(null as User | null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('users' as PeopleTab);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      if (!u || !isAdminEmail(u.email)) {
        router.replace('/');
        return;
      }
      setUser(u);
      setLoading(false);
      void upsertProfile(u);
    });
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-brand-dark text-white">
        <Navbar />
        <p className="py-24 text-center text-gray-400">Checking admin access…</p>
      </div>
    );
  }

  const tabs: { id: PeopleTab; label: string }[] = [
    { id: 'users', label: 'Users' },
    { id: 'admins', label: 'Admins' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold">Control center</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">People & history</h1>
            <p className="mt-1 text-sm text-gray-400">
              Registered users · active admins · action log · {user.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin"
              className="inline-flex min-h-[44px] items-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-white/10"
            >
              ← Dashboard
            </Link>
            <Link
              href="/admin/catalog"
              className="inline-flex min-h-[44px] items-center rounded-full border border-brand-green/40 bg-brand-green/15 px-4 py-2 text-sm font-semibold text-brand-green"
            >
              Catalog
            </Link>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, name, action…"
            className="min-h-[44px] w-full rounded-xl border border-white/15 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-brand-gold"
          />
        </div>

        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-white/10 pb-px">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setSearch('');
              }}
              className={
                'min-h-[44px] shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition ' +
                (tab === t.id
                  ? 'border-brand-gold text-brand-gold'
                  : 'border-transparent text-gray-400 hover:text-white')
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <AdminPeoplePanel tab={tab} search={search} />
      </div>
    </div>
  );
}
