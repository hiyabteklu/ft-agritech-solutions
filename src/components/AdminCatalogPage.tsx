'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/admin';
import Navbar from '@/components/Navbar';
import AdminCatalog from '@/components/AdminCatalog';

export default function AdminCatalogPage() {
  const router = useRouter();
  const [user, setUser] = useState(null as User | null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-brand-dark text-white">
        <Navbar />
        <p className="py-24 text-center text-gray-400">Checking admin access…</p>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Catalog manager</h1>
            <p className="mt-1 text-sm text-gray-400">
              Categories · problems · products · signed in as {user.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin"
              className="inline-flex min-h-[44px] items-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-white/10"
            >
              ← Submissions
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-white/10"
            >
              Portal
            </Link>
          </div>
        </div>

        <AdminCatalog onToast={setToast} />
      </div>
    </div>
  );
}
