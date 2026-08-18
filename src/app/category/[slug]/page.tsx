import CategoryPageClient from '@/components/CategoryPageClient';
import { sectors } from '@/data/sectors';

export function generateStaticParams() {
  return sectors.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const sector = sectors.find((s) => s.slug === params.slug);
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
  return <CategoryPageClient slug={params.slug} />;
}
