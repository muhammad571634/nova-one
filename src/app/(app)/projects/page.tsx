import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getDb, Job } from '@/lib/db';
import { 
  Plus, 
  Video, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  const db = getDb();

  const jobs = (db.prepare(
    'SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC'
  ).all(user!.id) as unknown) as Job[];

  function getStatusBadge(status: string) {
    switch (status) {
      case 'done':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Ready
          </span>
        );
      case 'awaiting_approval':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-[#0096C7] border border-cyan-200">
            <Sparkles className="w-3 h-3" /> Storyboard Ready
          </span>
        );
      case 'building':
      case 'rendering':
      case 'planning':
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
            <Clock className="w-3 h-3" /> In Progress
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900">
            Your Videos
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your AI-crafted product launch videos and storyboards
          </p>
        </div>

        <Link
          href="/new"
          className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-[#0F172A] hover:bg-slate-800 active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-sm hover:shadow group shrink-0"
        >
          <Plus className="w-4 h-4 text-[#00C2FF] group-hover:rotate-90 transition-transform duration-200" />
          <span>New Video</span>
        </Link>
      </div>

      {/* Projects List or Empty State */}
      {jobs.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-8 sm:p-12 text-center shadow-xs">
          <div className="max-w-md mx-auto space-y-6">
            {/* Visual Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 border border-cyan-200/60 flex items-center justify-center mx-auto shadow-inner">
              <Video className="w-8 h-8 text-[#00B4D8]" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-bold text-xl text-slate-900">
                No videos created yet
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Paste any website or landing page URL. Our autonomous AI tutor will capture assets, design a storyboard, record studio voiceovers, and render a high-converting launch video.
              </p>
            </div>

            <Link
              href="/new"
              className="inline-flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] hover:from-slate-800 hover:to-slate-900 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#00C2FF]" />
              <span>Create Your First Video</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            {/* How It Works Micro-Steps */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-wider block mb-1">
                  1. Paste URL
                </span>
                <p className="text-xs text-slate-600">
                  Provide your product or SaaS website link.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-wider block mb-1">
                  2. Review Storyboard
                </span>
                <p className="text-xs text-slate-600">
                  Inspect frame cards, scenes, voiceover, and timings.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-wider block mb-1">
                  3. Render MP4
                </span>
                <p className="text-xs text-slate-600">
                  One click to compile, sync audio, and export video.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Grid of Existing Jobs */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/projects/${job.id}`}
              className="group rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-cyan-300 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  {getStatusBadge(job.status)}
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-[#0096C7] transition-colors line-clamp-1">
                  {job.slug || 'Product Video'}
                </h3>
                <p className="mt-1 text-xs text-slate-500 truncate" title={job.source_url}>
                  {job.source_url}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>16:9 Landscape</span>
                </span>
                <span className="flex items-center gap-0.5 text-[#0096C7] font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}