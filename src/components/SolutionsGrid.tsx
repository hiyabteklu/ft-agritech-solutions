'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { sectors } from '@/data/sectors';

export default function SolutionsGrid() {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ query: string }>).detail;
      if (detail && typeof detail.query === 'string') {
        setQuery(detail.query);
      }
    };
    window.addEventListener('ft-search', handler);
    return () => window.removeEventListener('ft-search', handler);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sectors;
    return sectors.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.keywords.toLowerCase().includes(q) ||
        s.id.includes(q) ||
        s.subtitle.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <section id="solutions" className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-6 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Our Solutions
        </h2>

        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-md">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search solutions (e.g. honey, poultry, teff)..."
              className="w-full rounded-full border border-white/15 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-400 outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="py-12 text-center text-gray-400">
            No solutions found matching &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <Link
                key={item.slug}
                href={`/category/${item.slug}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 transition-transform duration-300 hover:scale-[1.02]"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-xl font-semibold text-white">
                    {item.id} | {item.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-brand-green shadow-[0_0_8px_#10B981]" />
                    <span className="text-sm text-brand-green">Explore Solutions</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
