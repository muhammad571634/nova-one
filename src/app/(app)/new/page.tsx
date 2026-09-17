import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';

export default function NewVideoPlaceholderPage() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-8 sm:p-10 shadow-lg shadow-slate-200/40 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-[#00B4D8]" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            New Video Flow
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            The 3-step video creation wizard (Source URL &rarr; Style Presets &rarr; Settings &rarr; BRIEF.md generation) is scheduled next in <span className="font-semibold text-slate-800">Phase C (F3)</span>.
          </p>
        </div>

        <div className="pt-4 flex justify-center">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Projects</span>
          </Link>
        </div>
      </div>
    </div>
  );
}