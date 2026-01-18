import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import nextDynamic from 'next/dynamic';
import { Providers } from './providers';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AppLayout } from '@/components/AppLayout';

import { FloatingBackgroundWrapper } from '@/components/FloatingBackgroundWrapper';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Who Knows? - Privacy Mixer',
  description: 'Web3 Privacy App',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${spaceGrotesk.variable} antialiased bg-background-light dark:bg-background-dark font-display text-white selection:bg-primary/30 min-h-screen relative overflow-hidden`}>
        <Providers>
          {/* Background Assets */}
          <FloatingBackgroundWrapper />

          <div className="relative h-screen w-full overflow-hidden">
            <AppLayout>
              {children}
            </AppLayout>
          </div>
        </Providers>
      </body>
    </html>
  );
}
