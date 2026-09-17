import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect('/projects');
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center p-4 sm:p-6 bg-[#F8FAFC]">
      {/* Signature Top Ambient Aura */}
      <div className="ambient-aura" />

      {/* Main Content Container */}
      <div className="w-full max-w-md relative z-10">
        {children}
      </div>

      {/* Subtle Footer */}
      <footer className="mt-8 text-center text-xs text-slate-400 relative z-10">
        &copy; {new Date().getFullYear()} Nova One. Autonomous AI Video Creation.
      </footer>
    </div>
  );
}