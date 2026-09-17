'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FolderKanban, 
  CreditCard, 
  Plus, 
  LogOut, 
  Sparkles, 
  Menu, 
  X,
  Video
} from 'lucide-react';

interface SidebarProps {
  user: {
    email: string;
    balance: number;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  }

  const navItems = [
    {
      name: 'Projects',
      href: '/projects',
      icon: FolderKanban,
      match: (path: string) => path.startsWith('/projects') || path === '/',
    },
    {
      name: 'Billing & Plans',
      href: '/billing',
      icon: CreditCard,
      match: (path: string) => path.startsWith('/billing'),
    },
  ];

  const initialLetter = user.email ? user.email.charAt(0).toUpperCase() : 'U';

  const NavContent = (
    <div className="flex flex-col h-full justify-between p-4">
      {/* Brand & Main Actions */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <Link href="/projects" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0F172A] to-[#1E293B] flex items-center justify-center shadow-xs border border-slate-700/20 group-hover:scale-105 transition-transform duration-200">
              <Video className="w-4 h-4 text-[#00C2FF]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-extrabold text-xl tracking-tight text-slate-900">
                Nova
              </span>
              <span className="text-[10px] font-bold tracking-widest text-[#00B4D8] uppercase bg-cyan-50 border border-cyan-200/80 px-1.5 py-0.5 rounded-full">
                One
              </span>
            </div>
          </Link>
          {isMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Primary CTA */}
        <div className="px-1">
          <Link
            href="/new"
            onClick={() => setIsMobileOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0F172A] hover:bg-slate-800 active:scale-[0.98] text-white font-medium text-sm transition-all duration-150 shadow-sm hover:shadow group border border-slate-700/50"
          >
            <div className="w-4 h-4 rounded-full bg-[#00C2FF] flex items-center justify-center text-[#0F172A] group-hover:rotate-90 transition-transform duration-200">
              <Plus className="w-3 h-3 stroke-[2.5]" />
            </div>
            <span>New Video</span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.match(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-100/80 text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#00B4D8]' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Usage & Profile Section */}
      <div className="space-y-3 pt-4 border-t border-slate-200/80">
        {/* Credits / Free Plan Meter */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/40 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00B4D8]" />
              <span className="text-xs font-semibold text-slate-800">Free Tier</span>
            </div>
            <span className="text-xs font-bold text-slate-900 tabular-nums">
              {user.balance} / 5 left
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00C2FF] to-[#2B59FF] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, (user.balance / 5) * 100))}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500 leading-tight">
            5 autonomous video renders included with signup.
          </p>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {initialLetter}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-800 truncate" title={user.email}>
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <Link href="/projects" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0F172A] flex items-center justify-center">
            <Video className="w-3.5 h-3.5 text-[#00C2FF]" />
          </div>
          <span className="font-display font-bold text-lg text-slate-900">Nova One</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`md:hidden fixed top-0 bottom-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {NavContent}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-white border-r border-slate-200/80 z-30">
        {NavContent}
      </aside>
    </>
  );
}