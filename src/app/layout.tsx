import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LinguaSync - Daily Micro-Immersion for Tech Teams',
  description: 'Praktek harian bahasa Inggris dan Jepang untuk software engineering team menggunakan micro-drills, Web Speech API, dan team feedback ledger.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
