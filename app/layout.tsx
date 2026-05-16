import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ANIVEX STUDIO',
  description: 'Πλατφόρμα anime streaming με auth, HLS playback και admin εργαλεία.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el">
      <body>{children}</body>
    </html>
  );
}
