import { Suspense } from 'react';
import AdminPeoplePageClient from '@/components/AdminPeoplePageClient';

export const metadata = {
  title: 'Admin · People',
  description: 'Registered users, admins, and action history',
  robots: { index: false, follow: false },
};

export default function AdminPeoplePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-brand-dark text-gray-400">
          Loading people…
        </div>
      }
    >
      <AdminPeoplePageClient />
    </Suspense>
  );
}
