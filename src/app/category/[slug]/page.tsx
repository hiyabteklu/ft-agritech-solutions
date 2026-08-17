import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSectorBySlug, sectors } from '@/data/sectors';
import CategoryClient from '@/components/CategoryClient';

export function generateStaticParams() {
  return sectors.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const sector = getSectorBySlug(params.slug);
  if (!sector) return { title: 'Sector Not Found | FT Agri-Tech' };
  return {
    title: `${sector.title} | FT Agri-Tech Solutions`,
    description: sector.subtitle,
  };
}

export default function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const sector = getSectorBySlug(params.slug);
  if (!sector) notFound();

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/ftagritech1.jpg"
              alt="FT Agri-Tech"
              className="h-9 w-9 rounded-full object-cover"
            />
            <span className="text-lg font-semibold tracking-tight text-white">
              FT-Agri-Tech
            </span>
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            ← Back to Portal
          </Link>
        </div>
      </nav>

      <CategoryClient sector={sector} />
    </>
  );
}
