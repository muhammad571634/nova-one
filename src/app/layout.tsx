import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nova One — Autonomous AI Video Studio',
  description: 'Ship high-converting product launch videos in minutes powered by HyperFrames & AI agents.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased selection:bg-[#00C2FF]/20 selection:text-[#0F172A]">
        {children}
      </body>
    </html>
  );
}