import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LinguaSync - Platform Belajar Bahasa Harian & Komunitas Praktik',
  description: 'Praktek harian bahasa Inggris dan Jepang untuk semua kalangan melalui micro-drills, Web Speech API, dan apresiasi komunitas pembelajar.',
  icons: {
    icon: '/icon.svg',
  },
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
