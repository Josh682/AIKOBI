import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'AIMA | AI Market Analyzer', template: '%s | AIMA' },
  description: 'Platform riset pasar & strategi harga Tokopedia real-time berbasis AI untuk UMKM & Penjual Online.',
  keywords: ['AIMA', 'AI Market Analyzer', 'tokopedia', 'harga', 'e-commerce', 'analisis pasar'],
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
