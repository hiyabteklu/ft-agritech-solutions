import { Suspense } from 'react';
import AccountClient from '@/components/AccountClient';

export const metadata = {
  title: 'My Account | FT Agri-Tech Solutions',
  description: 'Your FT Agri-Tech account — orders, requests, and profile.',
};

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-brand-dark text-gray-400">
          Loading account…
        </div>
      }
    >
      <AccountClient />
    </Suspense>
  );
}
