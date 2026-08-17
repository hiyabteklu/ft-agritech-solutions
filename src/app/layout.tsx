import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FT Agri-Tech Solutions',
  description: 'Technology-driven agriculture solutions for Ethiopia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-dark text-white antialiased">
        {children}
      </body>
    </html>
  );
}
