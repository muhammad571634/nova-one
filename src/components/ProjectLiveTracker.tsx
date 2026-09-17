'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ExternalLink, 
  Clock, 
  Sparkles, 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Check, 
  Mic, 
  FileText, 
  Play, 
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Film,
  Download,
  Square,
  RotateCcw,
  Pencil,
  X,
  StopCircle,
  Sliders
} from 'lucide-react';
import { ParsedStoryboard, StoryboardFrame } from '@/lib/storyboard-parser';

interface MilestoneState {
  step: 'setup' | 'capture' | 'design' | 'storyboard' | 'building' | 'render' | 'ready';
  percentage: number;
  message: string;
  hasTokens: boolean;
  hasFrame: boolean;
  hasStoryboard: boolean;
  hasContactSheet: boolean;
  isBlocked: boolean;
  blockedReason?: string;
}

interface LogEvent {
  id: string;
  ts: string;
  type: string;
  text: string;
}

interface ProjectLiveTrackerProps {
  jobId: string;
  slug: string;
  sourceUrl: string;
  initialStatus: string;
  briefConfig: any;
  briefMarkdown: string;
  initialStoryboard?: ParsedStoryboard | null;
}

export default function ProjectLiveTracker({
  jobId,
  slug,
  sourceUrl,
  initialStatus,
  briefConfig,
  briefMarkdown,
  initialStoryboard,
}: ProjectLiveTrackerProps) {
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<MilestoneState>({
    step: 'setup',
    percentage: 10,
    message: 'Initializing job...',
    hasTokens: false,
    hasFrame: false,
    hasStoryboard: Boolean(initialStoryboard?.frames?.length),
    hasContactSheet: false,
    isBlocked: false,
  });

  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [isLogOpen, setIsLogOpen] = useState(true);
  const [storyboard, setStoryboard] = useState<ParsedStoryboard | null>(initialStoryboard || null);

  // Frame comments state: frameId -> string
  const [comments, setComments] = useState<Record<number, string>>({});
  const [activeCommentFrame, setActiveCommentFrame] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Brief Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUrl, setEditUrl] = useState(briefConfig?.url || sourceUrl || '');
  const [editKeyMessage, setEditKeyMessage] = useState(briefConfig?.keyMessage || '');
  const [editStylePreset, setEditStylePreset] = useState(briefConfig?.stylePreset || 'auto');
  const [editLength, setEditLength] = useState(briefConfig?.length || '45s');
  const [editVoice, setEditVoice] = useState(briefConfig?.voice || 'female');
  const [editIntent, setEditIntent] = useState(briefConfig?.intent || 'promote');

  const logsEndRef = useRef<HTMLDivElement | null>(null);

  const handleAction = async (
    action: 'revise' | 'build' | 'render' | 'cancel' | 'restart' | 'edit_brief',
    customPayload?: any
  ) => {
    setIsSubmitting(true);
    try {
      let payload = customPayload;
      if (!payload) {
        if (action === 'revise') payload = { comments };
        else if (action === 'edit_brief') {
          payload = {
            url: editUrl,
            keyMessage: editKeyMessage,
            stylePreset: editStylePreset,
            length: editLength,
            voice: editVoice,
            intent: editIntent,
          };
        } else {
          payload = {};
        }
      }

      const res = await fetch(`/api/jobs/${jobId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      if (res.ok) {
        if (action === 'revise') {
          setComments({});
          setActiveCommentFrame(null);
        }
        if (action === 'edit_brief') {
          setIsEditModalOpen(false);
        }
        window.location.reload();
      } else {
        const err = await res.json();
        alert(err.error || 'Action failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // If status is already terminal with storyboard, no need for active SSE unless revising
    if (status === 'done' || (status === 'awaiting_approval' && storyboard?.frames?.length)) {
      return;
    }

    const eventSource = new EventSource(`/api/jobs/${jobId}/events`);

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.status) {
          setStatus(data.status);
        }
        if (data.error) {
          setError(data.error);
        }
        if (data.milestones) {
          setMilestones(data.milestones);
        }
        if (Array.isArray(data.newEvents) && data.newEvents.length > 0) {
          setLogs((prev) => {
            const combined = [...prev];
            for (const ev of data.newEvents) {
              if (!combined.some((item) => item.id === ev.id)) {
                combined.push({
                  id: ev.id,
                  ts: ev.ts,
                  type: ev.type,
                  text: ev.payload?.text || ev.payload?.raw?.content || 'Agent activity',
                });
              }
            }
            return combined;
          });
        }
      } catch (err) {
        console.error('Failed to parse SSE payload:', err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [jobId, status, storyboard]);

  useEffect(() => {
    if (isLogOpen) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isLogOpen]);

  // Determine active capsule stage
  const capsuleSteps = [
    { key: 'setup', label: 'Setup', done: milestones.percentage >= 15 || status !== 'queued' },
    { key: 'capture', label: 'Capture', done: milestones.hasTokens || milestones.percentage >= 30 },
    { key: 'design', label: 'Design', done: milestones.hasFrame || milestones.percentage >= 45 },
    { key: 'storyboard', label: 'Storyboard', done: milestones.hasStoryboard || status === 'awaiting_approval' },
    { key: 'build', label: 'Build', done: status === 'building' || status === 'awaiting_render' || status === 'done' },
    { key: 'render', label: 'Render', done: status === 'done' },
  ];

  function getPillClass(st: { key: string; label: string; done: boolean }, index: number) {
    if (st.done) {
      return 'bg-cyan-50/80 border border-[#00B4D8] text-[#0096C7] font-bold shadow-2xs';
    }
    return 'bg-slate-50/60 text-slate-400 border border-slate-200/60';
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
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
              {slug.replace(/-/g, ' ')} — launch video
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs border ${
                status === 'awaiting_approval'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : status === 'failed'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : status === 'cancelled'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-cyan-50 text-[#0096C7] border-cyan-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  status === 'awaiting_approval'
                    ? 'bg-emerald-500'
                    : status === 'failed'
                    ? 'bg-rose-500'
                    : status === 'cancelled'
                    ? 'bg-amber-500'
                    : 'bg-[#00C2FF] animate-ping'
                }`}
              />
              <span className="capitalize">
                {status === 'awaiting_approval'
                  ? 'Storyboard Ready'
                  : status === 'planning'
                  ? 'Agent Generating Storyboard…'
                  : status === 'preparing'
                  ? 'Worker Initializing…'
                  : status === 'queued'
                  ? 'Queued in Worker'
                  : status === 'cancelled'
                  ? 'Generation Stopped'
                  : status === 'failed'
                  ? 'Generation Failed'
                  : status}
              </span>
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-1.5 font-mono">
            <span>Target:</span>
            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#0096C7] hover:underline inline-flex items-center gap-1"
              >
                <span>{sourceUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-slate-400 italic">Prompt-driven (No website URL)</span>
            )}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          {['queued', 'preparing', 'planning', 'building', 'revising', 'rendering', 'queued_building', 'queued_revising', 'queued_rendering'].includes(status) && (
            <button
              type="button"
              onClick={() => handleAction('cancel')}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/90 border border-rose-200/80 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Square className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
              <span>{isSubmitting ? 'Stopping…' : 'Stop Agent'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 transition-all shadow-2xs cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Brief</span>
          </button>
        </div>
      </div>

      {/* Cancelled / Stopped / Failed Banner */}
      {(status === 'cancelled' || status === 'failed') && (
        <div
          className={`rounded-3xl p-6 shadow-xs border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300 ${
            status === 'cancelled'
              ? 'bg-amber-50/70 border-amber-200/80 text-amber-950'
              : 'bg-rose-50/70 border-rose-200/80 text-rose-950'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                status === 'cancelled'
                  ? 'bg-amber-100 border-amber-200 text-amber-700'
                  : 'bg-rose-100 border-rose-200 text-rose-700'
              }`}
            >
              {status === 'cancelled' ? <StopCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-display font-bold text-base">
                {status === 'cancelled' ? 'Agent Generation Stopped' : 'Generation Halted'}
              </h3>
              <p
                className={`text-xs mt-0.5 max-w-xl leading-relaxed ${
                  status === 'cancelled' ? 'text-amber-800/80' : 'text-rose-800/80'
                }`}
              >
                {status === 'cancelled'
                  ? 'You paused this run. You can change your prompt, adjust or remove the website URL to create a purely text-driven video, or restart whenever ready.'
                  : error || 'An error occurred during agent processing. You can adjust the brief or retry cleanly.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-[#00C2FF]" />
              <span>Edit Brief & Restart</span>
            </button>
            <button
              type="button"
              onClick={() => handleAction('restart')}
              disabled={isSubmitting}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                status === 'cancelled'
                  ? 'border-amber-300 text-amber-900'
                  : 'border-rose-300 text-rose-900'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart As-Is</span>
            </button>
          </div>
        </div>
      )}

      {/* HeyGen Capsule Progress Bar */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-6 gap-1 sm:gap-2">
          {capsuleSteps.map((st, idx) => (
            <div
              key={st.key}
              className={`py-2 px-1 text-center rounded-xl text-xs transition-all ${getPillClass(
                st,
                idx
              )}`}
            >
              <span className="block sm:hidden">{idx + 1}</span>
              <span className="hidden sm:inline">{st.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Column Summary Card */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Style Preset
            </span>
            <p className="font-display font-bold text-base text-slate-900 capitalize">
              {briefConfig.stylePreset || 'Auto AI Match'}
            </p>
            <span className="text-[11px] text-slate-500 block">13 Verified Showcases</span>
          </div>

          <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Target Duration
            </span>
            <p className="font-display font-bold text-base text-slate-900 tabular-nums">
              {briefConfig.length || '45s'}
            </p>
            <span className="text-[11px] text-slate-500 block">16:9 Landscape (1080p)</span>
          </div>

          <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Voice Narration
            </span>
            <p className="font-display font-bold text-base text-slate-900 capitalize">
              {briefConfig.voice || 'Female'} Voice
            </p>
            <span className="text-[11px] text-slate-500 block">HeyGen Studio OAuth</span>
          </div>

          <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Intent Mode
            </span>
            <p className="font-display font-bold text-base text-slate-900">
              {briefConfig.intent === 'show_site' ? 'Show Site As-Is' : 'Promote Product'}
            </p>
            <span className="text-[11px] text-slate-500 block">Conversion Angle</span>
          </div>
        </div>
      </div>

      {/* Live Agent Terminal / Activity Drawer */}
      <div className="rounded-3xl border border-slate-200/90 bg-slate-900 text-slate-200 overflow-hidden shadow-md">
        <button
          type="button"
          onClick={() => setIsLogOpen(!isLogOpen)}
          className="w-full flex items-center justify-between px-6 py-3.5 bg-slate-950/80 border-b border-slate-800 text-left hover:bg-slate-950 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-[#00C2FF]" />
            <span className="font-mono text-xs font-bold text-slate-300">Live Agent Stream</span>
            {status === 'planning' && (
              <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 font-mono animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Streaming…</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{logs.length} events</span>
            {isLogOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isLogOpen && (
          <div className="p-4 max-h-64 overflow-y-auto font-mono text-xs space-y-1.5 bg-slate-900/95 scrollbar-thin">
            {logs.length === 0 ? (
              <p className="text-slate-500 italic py-2">
                Worker is waiting or initializing Claude Code runner…
              </p>
            ) : (
              logs.map((lg) => (
                <div key={lg.id} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-500 text-[10px] shrink-0 pt-0.5 tabular-nums">
                    {new Date(lg.ts).toLocaleTimeString()}
                  </span>
                  <span
                    className={`shrink-0 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      lg.type === 'tool'
                        ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                        : lg.type === 'step'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {lg.type}
                  </span>
                  <span className="text-slate-300 break-words">{lg.text}</span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>

      {/* RENDER / RESULT SECTION */}
      {['awaiting_render', 'queued_rendering', 'rendering', 'done'].includes(status) && (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-8 shadow-sm flex flex-col items-center justify-center space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
            <Film className="w-8 h-8 text-[#0096C7]" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-slate-900">
              {status === 'done' ? 'Video Ready!' : 'Video Assembled'}
            </h2>
            <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">
              {status === 'done' 
                ? 'Your video has been successfully rendered. You can preview or download it now.'
                : 'The agent has finished building the timeline. Render the final MP4 video to proceed.'}
            </p>
          </div>
          
          {status === 'awaiting_render' && (
            <button
              onClick={() => handleAction('render')}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] hover:from-slate-800 hover:to-slate-900 text-white font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-5 h-5 text-emerald-400" />
              <span>{isSubmitting ? 'Queueing...' : 'Render Video (MP4)'}</span>
            </button>
          )}

          {(status === 'queued_rendering' || status === 'rendering') && (
            <div className="flex items-center gap-3 text-[#0096C7] font-semibold font-display">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Rendering video... this may take a few minutes.</span>
            </div>
          )}

          {status === 'done' && (
            <a
              href={`/api/jobs/${jobId}/files/renders/video.mp4`}
              target="_blank"
              download
              className="px-8 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-all flex items-center gap-2"
            >
              <Download className="w-5 h-5 text-slate-400" />
              Download MP4
            </a>
          )}
        </div>
      )}

      {/* STORYBOARD SECTION — REVEALED WHEN READY! */}
      {storyboard && storyboard.frames && storyboard.frames.length > 0 && !['awaiting_render', 'queued_rendering', 'rendering', 'done'].includes(status) && (
        <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#00B4D8]" />
                <h2 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
                  Generated Storyboard & Scene Flow
                </h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {storyboard.message || 'Review each beat, spoken dialogue, and motion outline before building.'}
              </p>
            </div>

            {/* Action Buttons */}
            {status === 'awaiting_approval' && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAction('revise')}
                  disabled={isSubmitting || Object.keys(comments).length === 0}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Comments'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('build')}
                  disabled={isSubmitting}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] hover:from-slate-800 hover:to-slate-900 text-white text-sm font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 text-[#00C2FF]" />
                  <span>{isSubmitting ? 'Building...' : 'Approve & Build Video'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Grid of Frame Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storyboard.frames.map((fr) => {
              const hasComment = Boolean(comments[fr.id]);
              const isOpen = activeCommentFrame === fr.id;

              return (
                <div
                  key={fr.id}
                  className="rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  {/* Card Header & Scene */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-display uppercase tracking-wider text-[#0096C7] bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full">
                        Frame {fr.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 tabular-nums bg-slate-100 px-2 py-0.5 rounded-md">
                        {fr.duration}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-base text-slate-900 leading-snug">
                      {fr.title}
                    </h3>

                    {/* Scene Description */}
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      {fr.scene}
                    </p>

                    {/* Voiceover Bubble */}
                    <div className="p-3.5 rounded-2xl bg-cyan-50/30 border border-cyan-100/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Mic className="w-3.5 h-3.5 text-[#00B4D8]" />
                        <span>Voiceover:</span>
                      </div>
                      <p className="text-xs text-slate-700 italic leading-relaxed">
                        &ldquo;{fr.voiceover}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Soft Light Agency Comment Drawer (Per User Specification) */}
                  {status === 'awaiting_approval' && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-3.5">
                      {isOpen ? (
                        <div className="space-y-2.5">
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                            Feedback on Frame {fr.id}
                          </label>
                          <textarea
                            rows={3}
                            value={comments[fr.id] || ''}
                            onChange={(e) =>
                              setComments({ ...comments, [fr.id]: e.target.value })
                            }
                            placeholder="Change wording, adjust speed, or swap image..."
                            className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/30 focus:border-[#00B4D8] resize-y min-h-[70px] max-h-[160px]"
                          />
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setActiveCommentFrame(null)}
                              className="text-xs text-slate-500 hover:text-slate-800"
                            >
                              Done
                            </button>
                            <span className="text-[10px] text-slate-400">
                              Saved in memory
                            </span>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveCommentFrame(fr.id)}
                          className="w-full py-1.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-600 transition-colors flex items-center justify-between"
                        >
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                            <span>{hasComment ? 'Edit Feedback' : 'Add Note / Comment'}</span>
                          </span>
                          {hasComment && (
                            <span className="w-2 h-2 rounded-full bg-[#00B4D8]" />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BRIEF.md Inspection Drawer */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#00B4D8]" />
            <h3 className="font-display font-bold text-sm text-slate-900">
              Workspace Contract (BRIEF.md)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">videos/{slug}/BRIEF.md</span>
        </div>
        <pre className="font-mono text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-60">
          {briefMarkdown || 'Loading brief...'}
        </pre>
      </div>

      {/* Edit Brief Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200/90 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#00B4D8]" />
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Edit Video Brief & Prompt
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Target Website URL (Optional)
              </label>
              <input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://yourproduct.com (or leave blank for pure text prompt)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/30 focus:border-[#00B4D8] focus:bg-white transition-all font-mono"
              />
              <p className="text-[11px] text-slate-500">
                Leave blank or remove URL if you want the agent to build based purely on your custom prompt without scraping.
              </p>
            </div>

            {/* Custom Prompt / Key Message */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Custom Instructions & Prompt
              </label>
              <textarea
                rows={4}
                value={editKeyMessage}
                onChange={(e) => setEditKeyMessage(e.target.value)}
                placeholder="E.g., Create a high-energy 30-second promo for our AI editor. Highlight speed, show code snippets, use dark mode with purple accents, female voiceover..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/30 focus:border-[#00B4D8] focus:bg-white transition-all resize-y"
              />
            </div>

            {/* Style Preset & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Style Preset
                </label>
                <select
                  value={editStylePreset}
                  onChange={(e) => setEditStylePreset(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/30 focus:border-[#00B4D8] focus:bg-white transition-all"
                >
                  <option value="auto">Auto AI Match</option>
                  <option value="coral">Coral (Linear Style)</option>
                  <option value="punchy">Punchy (Vibrant & Bold)</option>
                  <option value="mono">Monochrome (Dark Minimal)</option>
                  <option value="technical">Technical (Developer)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Duration
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['30s', '45s', '60s'] as const).map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setEditLength(len)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        editLength === len
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Voice & Intent */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Voice Narration
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['female', 'male'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setEditVoice(v)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border capitalize transition-all cursor-pointer ${
                        editVoice === v
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Intent Mode
                </label>
                <select
                  value={editIntent}
                  onChange={(e) => setEditIntent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/30 focus:border-[#00B4D8] focus:bg-white transition-all"
                >
                  <option value="promote">Promote Product</option>
                  <option value="show_site">Show Site As-Is</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAction('edit_brief')}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] hover:from-slate-800 hover:to-slate-900 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00C2FF]" />
                <span>{isSubmitting ? 'Saving & Starting…' : 'Save & Start Agent'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}