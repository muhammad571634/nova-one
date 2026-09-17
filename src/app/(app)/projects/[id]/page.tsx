import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import fs from 'node:fs';
import path from 'node:path';
import { getCurrentUser } from '@/lib/auth';
import { getDb, Job } from '@/lib/db';
import { 
  ArrowLeft, 
  ExternalLink, 
  Clock, 
  Sparkles, 
  Code, 
  Layers, 
  Mic, 
  Timer, 
  FileText,
  CheckCircle2
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const user = await getCurrentUser();
  const db = getDb();

  const job = (db.prepare(
    'SELECT * FROM jobs WHERE id = ? AND user_id = ?'
  ).get(id, user!.id) as unknown) as Job | undefined;

  if (!job) {
    notFound();
  }

  let briefConfig: any = {};
  try {
    briefConfig = JSON.parse(job.brief_json);
  } catch {
    briefConfig = {};
  }

  let briefMarkdown = '';
  const briefFilePath = path.join(job.job_dir, 'BRIEF.md');
  if (fs.existsSync(briefFilePath)) {
    briefMarkdown = fs.readFileSync(briefFilePath, 'utf8');
  }

  const steps = [
    { label: 'Setup', active: job.status === 'queued' || job.status === 'preparing' },
    { label: 'Capture', active: job.status === 'planning' },
    { label: 'Design', active: false },
    { label: 'Storyboard', active: job.status === 'awaiting_approval' },
    { label: 'Build', active: job.status === 'building' },
    { label: 'Render', active: job.status === 'done' },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </Link>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900 capitalize">
              {job.slug.replace(/-/g, ' ')} — launch video
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-[#0096C7] border border-cyan-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-ping" />
              <span>Queued (Ready for Agent)</span>
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-1.5 font-mono">
            <span>Source:</span>
            <a
              href={job.source_url}
              target="_blank"
              rel="noreferrer"
              className="text-[#0096C7] hover:underline inline-flex items-center gap-1"
            >
              <span>{job.source_url}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>

      {/* HeyGen Capsule Progress Bar */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-6 gap-1 sm:gap-2">
          {steps.map((st, idx) => (
            <div
              key={st.label}
              className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all ${
                st.active
                  ? 'bg-cyan-50 border border-[#00B4D8] text-[#0096C7] font-bold shadow-2xs'
                  : 'bg-slate-50/50 text-slate-400 border border-slate-100'
              }`}
            >
              <span className="block sm:hidden">{idx + 1}</span>
              <span className="hidden sm:inline">{st.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Column Summary Card with Vertical Dividers */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Style Preset
            </span>
            <p className="font-display font-bold text-base text-slate-900 capitalize">
              {briefConfig.stylePreset || 'Auto AI Match'}
            </p>
            <span className="text-[11px] text-slate-500 block">
              13 Verified Showcases
            </span>
          </div>

          <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Target Duration
            </span>
            <p className="font-display font-bold text-base text-slate-900 tabular-nums">
              {briefConfig.length || '45s'}
            </p>
            <span className="text-[11px] text-slate-500 block">
              16:9 Landscape (1080p)
            </span>
          </div>

          <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Voice Narration
            </span>
            <p className="font-display font-bold text-base text-slate-900 capitalize">
              {briefConfig.voice || 'Female'} Voice
            </p>
            <span className="text-[11px] text-slate-500 block">
              HeyGen Free OAuth TTS
            </span>
          </div>

          <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Intent Mode
            </span>
            <p className="font-display font-bold text-base text-slate-900">
              {briefConfig.intent === 'show_site' ? 'Show Site As-Is' : 'Promote Product'}
            </p>
            <span className="text-[11px] text-slate-500 block">
              Conversion Angle
            </span>
          </div>
        </div>
      </div>

      {/* BRIEF.md Inspection Panel (Debug Panel per PLAN.md § 8, F3) */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#00B4D8]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-slate-900">
                Generated BRIEF.md
              </h2>
              <p className="text-xs text-slate-500">
                Official HyperFrames contract confirmed and stored in workspace
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
            flow: automation
          </span>
        </div>

        <pre className="font-mono text-xs text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-96">
          {briefMarkdown || 'BRIEF.md is being formatted...'}
        </pre>

        <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-200/60 flex items-start gap-3 text-xs text-slate-600">
          <Sparkles className="w-4 h-4 text-[#00B4D8] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800">Ready for Autonomous Execution:</span> In Phase D & E, the background worker will initialize the workspace and run Claude Code with this brief to capture screenshots, build scenes, and render your video without human interruption.
          </div>
        </div>
      </div>
    </div>
  );
}