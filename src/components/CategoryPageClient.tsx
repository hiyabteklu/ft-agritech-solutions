'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CategoryClient from '@/components/CategoryClient';
import { fetchSectorBySlug, type SectorFull } from '@/lib/catalog';
import { getSectorBySlug } from '@/data/sectors';

export default function CategoryPageClient({ slug }: { slug: string }) {
  const fallback = getSectorBySlug(slug);
  const [sector, setSector] = useState((fallback as SectorFull) || null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchSectorBySlug(slug).then((s) => {
      if (cancelled) return;
      if (s) setSector(s);
      else if (!fallback) setMissing(true);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug, fallback]);

  if (missing) {
    notFound();
  }

  if (!sector) {
    return (
      <>
        <Navbar />
        <p className="py-24 text-center text-gray-400">
          {loading ? 'Loading sector…' : 'Sector not found'}
        </p>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <CategoryClient sector={sector} />
      <Footer />
    </>
  );
}
