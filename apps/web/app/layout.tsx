import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'DataScrapper — BaaS E-commerce Scraping API', template: '%s | DataScrapper' },
  description: 'API platform untuk ekstraksi data produk dari Tokopedia, Shopee, dan marketplace Indonesia lainnya.',
  keywords: ['scraping', 'api', 'tokopedia', 'shopee', 'e-commerce', 'data', 'baas'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
