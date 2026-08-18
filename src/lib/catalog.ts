import { supabase, hasSupabaseConfig } from '@/lib/supabase';
import { sectors as staticSectors, type Sector, type Product } from '@/data/sectors';

export type { Sector, Product };

export type CatalogType = 'local' | 'imported';

export type DbSector = {
  id: string;
  slug: string;
  code: string;
  title: string;
  subtitle: string;
  scope: string;
  img_prefix: string;
  keywords: string;
  image: string;
  sort_order: number;
  published: boolean;
};

export type DbProblem = {
  id: string;
  sector_id: string;
  title: string;
  body: string;
  sort_order: number;
};

export type DbProduct = {
  id: string;
  sector_id: string;
  catalog_type: CatalogType;
  name: string;
  solves: string;
  price: string;
  rating: string;
  status: string;
  description: string;
  image_path: string;
  sort_order: number;
  published: boolean;
};

export type SectorFull = Sector & {
  dbId?: string;
  problemsDb?: DbProblem[];
  productsDb?: DbProduct[];
};

function productImagePath(name: string, imagePath?: string): string {
  if (imagePath) return imagePath;
  return `/assets/images/${name.toLowerCase().replace(/\s+/g, '_')}.jpg`;
}

function mapDbToSector(
  s: DbSector,
  problems: DbProblem[],
  products: DbProduct[]
): SectorFull {
  const local = products
    .filter((p) => p.catalog_type === 'local')
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(
      (p): Product & { dbId?: string } => ({
        name: p.name,
        solves: p.solves,
        price: p.price,
        rating: p.rating,
        status: p.status,
        desc: p.description,
        dbId: p.id,
        imagePath: p.image_path || productImagePath(p.name),
      }) as Product & { dbId?: string; imagePath?: string }
    );

  const imported = products
    .filter((p) => p.catalog_type === 'imported')
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(
      (p): Product & { dbId?: string } => ({
        name: p.name,
        solves: p.solves,
        price: p.price,
        rating: p.rating,
        status: p.status,
        desc: p.description,
        dbId: p.id,
        imagePath: p.image_path || productImagePath(p.name),
      }) as Product & { dbId?: string; imagePath?: string }
    );

  return {
    slug: s.slug,
    id: s.code || s.slug,
    title: s.title,
    subtitle: s.subtitle,
    scope: s.scope,
    imgPrefix: s.img_prefix,
    keywords: s.keywords,
    image: s.image,
    problems: problems
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((p) => ({ title: p.title, text: p.body })),
    products: { local, imported },
    dbId: s.id,
    problemsDb: problems,
    productsDb: products,
  };
}

export async function fetchAllSectors(): Promise<SectorFull[]> {
  if (!hasSupabaseConfig()) return staticSectors as SectorFull[];

  const { data: sectors, error } = await supabase
    .from('sectors')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true });

  if (error || !sectors?.length) {
    console.warn('[catalog] sectors fetch failed or empty, using static', error?.message);
    return staticSectors as SectorFull[];
  }

  const ids = sectors.map((s) => s.id);
  const [{ data: problems }, { data: products }] = await Promise.all([
    supabase.from('sector_problems').select('*').in('sector_id', ids).order('sort_order'),
    supabase
      .from('products')
      .select('*')
      .in('sector_id', ids)
      .eq('published', true)
      .order('sort_order'),
  ]);

  return (sectors as DbSector[]).map((s) =>
    mapDbToSector(
      s,
      ((problems as DbProblem[]) || []).filter((p) => p.sector_id === s.id),
      ((products as DbProduct[]) || []).filter((p) => p.sector_id === s.id)
    )
  );
}

export async function fetchSectorBySlug(slug: string): Promise<SectorFull | null> {
  if (!hasSupabaseConfig()) {
    return (staticSectors.find((s) => s.slug === slug) as SectorFull) || null;
  }

  const { data: sector, error } = await supabase
    .from('sectors')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !sector) {
    const fallback = staticSectors.find((s) => s.slug === slug);
    return (fallback as SectorFull) || null;
  }

  const s = sector as DbSector;
  const [{ data: problems }, { data: products }] = await Promise.all([
    supabase
      .from('sector_problems')
      .select('*')
      .eq('sector_id', s.id)
      .order('sort_order'),
    supabase
      .from('products')
      .select('*')
      .eq('sector_id', s.id)
      .order('sort_order'),
  ]);

  // Admin sees unpublished; public path filters published products
  const prods = ((products as DbProduct[]) || []).filter((p) => p.published);
  return mapDbToSector(s, (problems as DbProblem[]) || [], prods);
}

/** Admin: all sectors including unpublished + all products */
export async function fetchCatalogAdmin(): Promise<{
  sectors: DbSector[];
  problems: DbProblem[];
  products: DbProduct[];
  error?: string;
}> {
  const [s, p, pr] = await Promise.all([
    supabase.from('sectors').select('*').order('sort_order', { ascending: true }),
    supabase.from('sector_problems').select('*').order('sort_order', { ascending: true }),
    supabase.from('products').select('*').order('sort_order', { ascending: true }),
  ]);

  const err =
    s.error?.message || p.error?.message || pr.error?.message || undefined;

  return {
    sectors: (s.data as DbSector[]) || [],
    problems: (p.data as DbProblem[]) || [],
    products: (pr.data as DbProduct[]) || [],
    error: err,
  };
}

export function productImageFromName(name: string, imagePath?: string) {
  return productImagePath(name, imagePath);
}
