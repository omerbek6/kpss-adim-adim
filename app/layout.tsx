import type { Metadata, Viewport } from 'next';
import './globals.css';
import './mobile.css';
import './workspace.css';

export const metadata: Metadata = {
  title: 'Adım Adım · KPSS çalışma defterim',
  description:
    'Kişisel KPSS programın, odak sayacın, deneme ve ilerleme defterin.',
  appleWebApp: { capable: true, title: 'Adım Adım', statusBarStyle: 'default' },
  icons: {
    icon: '/icons/icon-192.png',
    apple: [
      {
        url: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#122441',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link
          rel="manifest"
          href="/manifest.webmanifest"
          crossOrigin="use-credentials"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
