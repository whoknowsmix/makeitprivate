import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Who Knows? - Privacy Mixer',
  description: 'Web3 Privacy App',
};

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
          <div className="floating-asset top-[15%] left-[10%] scale-150 pointer-events-none fixed">
            <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 200" }}>lock</span>
          </div>
          <div className="floating-asset bottom-[20%] right-[12%] scale-125 rotate-12 pointer-events-none fixed">
            <span className="material-symbols-outlined text-[100px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 200" }}>shield</span>
          </div>
          <div className="floating-asset top-[40%] right-[5%] scale-75 -rotate-12 pointer-events-none fixed">
            <span className="material-symbols-outlined text-[80px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 200" }}>fingerprint</span>
          </div>

          <div className="relative flex h-screen w-full z-10">
            <Sidebar />
            <main className="flex-1 flex flex-col relative overflow-y-auto">
              <Header />
              {children}
              <Footer />
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
