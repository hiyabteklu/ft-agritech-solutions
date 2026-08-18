'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { sectors as staticSectors } from '@/data/sectors';
import { fetchAllSectors, type SectorFull } from '@/lib/catalog';

export default function SolutionsGrid() {
  const [query, setQuery] = useState('');
  const [sectors, setSectors] = useState(staticSectors as SectorFull[]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchAllSectors().then((list) => {
      if (!cancelled && list.length) setSectors(list);
      if (!cancelled) setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
  }, [query, sectors]);

  return (
    <section id="solutions" className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-6 animate-fade-up text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Our Products
        </h2>

        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-md">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products (e.g. honey, poultry, teff)..."
              className="w-full rounded-full border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-base text-white placeholder-gray-400 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/40"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-gray-400">
              🔍
            </span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="py-12 text-center text-base text-gray-400">
            {loaded ? (
              <>
                No products found matching &ldquo;{query}&rdquo;.
              </>
            ) : (
              'Loading products…'
            )}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item, i) => (
              <Link
                key={item.slug}
                href={`/category/${item.slug}`}
                className={
                  'tile-3d group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 animate-fade-up stagger-' +
                  Math.min(i + 1, 6)
                }
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <h3 className="text-xl font-semibold text-white sm:text-2xl">
                    {item.id} | {item.title}
                  </h3>
                  <div className="mt-3 flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 animate-soft-pulse rounded-full bg-brand-green shadow-[0_0_10px_#10B981]" />
                    <span className="text-sm font-medium text-brand-green sm:text-base">
                      Explore Products
                    </span>
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
