import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Adım Adım · KPSS çalışma defterim',
  description:
    'Konu süreleri, küçük çalışma adımları ve kişisel ilerleme takibi.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
