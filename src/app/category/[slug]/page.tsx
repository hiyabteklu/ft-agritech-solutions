import { notFound } from 'next/navigation';
import { getSectorBySlug, sectors } from '@/data/sectors';
import CategoryClient from '@/components/CategoryClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export function generateStaticParams() {
  return sectors.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const sector = getSectorBySlug(params.slug);
  if (!sector) return { title: 'Sector Not Found' };
  return {
    title: sector.title,
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
      <Navbar />
      <CategoryClient sector={sector} />
      <Footer />
    </>
  );
}
