import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ANIVEX STUDIO',
  description: 'Production-ready anime streaming platform architecture.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
