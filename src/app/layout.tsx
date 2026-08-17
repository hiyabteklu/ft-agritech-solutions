import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://ft-agri-tech.systems'),
  title: {
    default: 'FT Agri-Tech Solutions',
    template: '%s | FT Agri-Tech Solutions',
  },
  description:
    'Technology-driven agriculture solutions for Ethiopia — apiculture, poultry, horticulture, livestock, export crops, staple grains, and aquaculture.',
  keywords: [
    'FT Agri-Tech',
    'Ethiopia agriculture',
    'agritech',
    'smart farming',
    'apiculture',
    'livestock',
    'horticulture',
  ],
  openGraph: {
    title: 'FT Agri-Tech Solutions',
    description:
      'Practical engineering solutions for real agricultural challenges across Ethiopia.',
    url: 'https://ft-agri-tech.systems',
    siteName: 'FT Agri-Tech Solutions',
    locale: 'en_ET',
    type: 'website',
    images: [{ url: '/ftagritech1.jpg', width: 512, height: 512, alt: 'FT Agri-Tech' }],
  },
  twitter: {
    card: 'summary',
    title: 'FT Agri-Tech Solutions',
    description: 'Technology-driven agriculture solutions for Ethiopia.',
  },
  robots: { index: true, follow: true },
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
