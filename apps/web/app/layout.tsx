import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AikobiTopbar } from '@/components/aikobi-topbar';
import { AikobiFooter } from '@/components/aikobi-footer';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0F17' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: { default: 'AIKOBI | Akal Imitasi Konsultan Bisnis', template: '%s | AIKOBI' },
  description:
    'Mitra strategis AI cerdas, taktis, dan terpercaya untuk optimasi harga, varian, dan etalase Tokopedia bagi merchant UMKM Indonesia.',
  keywords: [
    'AIKOBI',
    'Akal Imitasi Konsultan Bisnis',
    'Konsultan AI UMKM',
    'Tokopedia Price Optimizer',
    'Riset Pasar E-Commerce',
    'Strategi Harga Tokopedia',
    'Sweet Spot Tokopedia',
    'Scraper Tokopedia',
  ],
  authors: [{ name: 'Tim AIKOBI' }],
  creator: 'AIKOBI',
  openGraph: {
    title: 'AIKOBI | Akal Imitasi Konsultan Bisnis',
    description:
      'Platform riset pasar & strategi harga Tokopedia real-time berbasis AI untuk UMKM & Penjual Online.',
    siteName: 'AIKOBI',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIKOBI | Akal Imitasi Konsultan Bisnis',
    description:
      'Platform riset pasar & strategi harga Tokopedia real-time berbasis AI untuk UMKM & Penjual Online.',
  },
  icons: {
    icon: [
      { url: '/brand/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/brand/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,500;1,600;1,700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('aikobi-theme');
                  var supportDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && supportDark)) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-[100dvh] flex flex-col bg-aikobi-bg text-aikobi-text-primary antialiased overflow-x-clip"
      >
        <AikobiTopbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          {children}
        </main>
        <AikobiFooter />
      </body>
    </html>
  );
}
