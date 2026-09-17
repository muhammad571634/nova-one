import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

export const dynamic = 'force-dynamic';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC]">
      {/* Ambient Mesh Aura */}
      <div className="ambient-aura" />

      {/* Persistent / Responsive Sidebar */}
      <Sidebar user={user} />

      {/* Main App Canvas */}
      <main className="flex-1 min-w-0 relative z-10 flex flex-col min-h-screen">
        <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}