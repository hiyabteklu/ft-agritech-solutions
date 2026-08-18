import { Suspense } from 'react';
import AdminCatalogPage from '@/components/AdminCatalogPage';

export const metadata = {
  title: 'Catalog Admin',
  description: 'Manage FT Agri-Tech categories, problems, and products',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-brand-dark text-gray-400">
          Loading catalog admin…
        </div>
      }
    >
      <AdminCatalogPage />
    </Suspense>
  );
}
