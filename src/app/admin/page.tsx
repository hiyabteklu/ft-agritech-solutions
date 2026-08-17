import { Suspense } from 'react';
import AdminClient from '@/components/AdminClient';

export const metadata = {
  title: 'Admin',
  description: 'FT Agri-Tech internal submissions dashboard',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-brand-dark text-gray-400">
          Loading admin…
        </div>
      }
    >
      <AdminClient />
    </Suspense>
  );
}
