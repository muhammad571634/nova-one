'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Sliders, 
  Sparkles, 
  Save, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Type, 
  Mic, 
  Eye, 
  ExternalLink, 
  Loader2, 
  Layers, 
  AlertCircle,
  Plus,
  Minus,
  Film,
  Lock,
  ArrowRight
} from 'lucide-react';
import { StoryboardFrame } from '@/lib/storyboard-parser';

export interface SceneItem {
  id: string;
  numericId: number;
  templateTitle: string;
  sceneTitle: string;
  role: string;
  sceneDescription: string;
  vo: string;
  dur: number;
  image?: string;
  bgFallback?: string;
}

interface SimpleVisualEditorProps {
  jobId: string;
  slug: string;
  brandName: string;
  initialScenes: SceneItem[];
  aspect?: '16:9' | '9:16' | '1:1';
  brandColor?: string;
  status: string;
  balance?: number;
  onOpenStudio: () => void;
  isStudioLoading: boolean;
  studioInfo?: { isRunning?: boolean; url?: string; port?: number } | null;
  onRender: () => void;
  isSubmitting: boolean;
  onCloseEditor?: () => void;
  onDescribeChange?: (instruction: string) => void;
}

export default function SimpleVisualEditor({
  jobId,
  slug,
  brandName,
  initialScenes,
  aspect = '16:9',
  brandColor = '#2B59FF',
  status,
  balance = 5,
  onOpenStudio,
  isStudioLoading,
  studioInfo,
  onRender,
  isSubmitting,
  onCloseEditor,
  onDescribeChange,
}: SimpleVisualEditorProps) {
  const [scenes, setScenes] = useState<SceneItem[]>(initialScenes);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [aiScenePrompt, setAiScenePrompt] = useState('');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Active scene
  const activeScene = scenes[activeIndex] || scenes[0];

  useEffect(() => {
    setScenes(initialScenes);
  }, [initialScenes]);

  // Update field on active scene
  const updateActiveScene = (field: keyof SceneItem, value: string | number) => {
    setScenes((prev) => {
      const updated = [...prev];
      if (updated[activeIndex]) {
        updated[activeIndex] = {
          ...updated[activeIndex],
          [field]: value,
        };
      }
      return updated;
    });
  };

  const handleDurationChange = (delta: number) => {
    if (!activeScene) return;
    const newDur = Math.max(2, Math.min(30, activeScene.dur + delta));
    updateActiveScene('dur', newDur);
  };

  const totalDuration = scenes.reduce((acc, s) => acc + s.dur, 0);

  // Save changes to API
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const framesPayload: StoryboardFrame[] = scenes.map((s, idx) => ({
        id: s.numericId || idx + 1,
        title: s.sceneTitle,
        scene: s.sceneDescription || s.sceneTitle,
        voiceover: s.vo,
        duration: `${s.dur}s`,
        type: s.role,
        status: 'approved',
      }));

      const res = await fetch(`/api/jobs/${jobId}/scenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frames: framesPayload }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save scene changes.');
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiChangeSubmit = () => {
    if (!aiScenePrompt.trim()) return;
    const instruction = `Scene ${activeIndex + 1} (${activeScene.role}): ${aiScenePrompt.trim()}`;
    if (onDescribeChange) {
      onDescribeChange(instruction);
      setAiScenePrompt('');
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden flex flex-col space-y-0 animate-in fade-in duration-200">
      {/* 1. Top Editor Header Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCloseEditor}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-white text-xs font-bold text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Back to Grid View"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Card Grid View</span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-sm text-slate-900">
              Simple Visual Editor
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
              {aspect}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Advanced Studio Button */}
          {studioInfo?.isRunning ? (
            <a
              href={studioInfo.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-2xs hover:bg-emerald-100 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Studio :{studioInfo.port}</span>
              <ExternalLink className="w-3 h-3 text-emerald-600" />
            </a>
          ) : (
            <button
              type="button"
              onClick={onOpenStudio}
              disabled={isStudioLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-white text-slate-700 font-bold text-xs transition-all cursor-pointer shadow-2xs disabled:opacity-50"
              title="Open Advanced HyperFrames Studio"
            >
              {isStudioLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : (
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{isStudioLoading ? 'Opening…' : 'Advanced: Studio'}</span>
            </button>
          )}

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-xs transition-all shadow-2xs cursor-pointer ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-white hover:bg-slate-50 border border-slate-300 text-slate-800'
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
            ) : savedSuccess ? (
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            ) : (
              <Save className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{savedSuccess ? 'Saved!' : isSaving ? 'Saving…' : 'Save Changes'}</span>
          </button>

          {/* Render Action Button */}
          <button
            type="button"
            onClick={onRender}
            disabled={isSubmitting || balance < 1}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs ${
              balance < 1
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
            }`}
          >
            {balance < 1 ? (
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white text-white" />
            )}
            <span>{balance < 1 ? '0 Credits' : 'Render Video (MP4)'}</span>
          </button>
        </div>
      </div>

      {saveError && (
        <div className="px-6 py-2 bg-rose-50 border-b border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>{saveError}</span>
        </div>
      )}

      {/* 2. Main Split Canvas: Left Stage Preview + Right Scene Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
        {/* Left Stage Preview (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 bg-slate-950 flex flex-col items-center justify-center relative select-none">
          {/* Background ambient aura */}
          <div
            className="absolute inset-0 opacity-25 blur-3xl pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${brandColor}, transparent 70%)`,
            }}
          />

          {/* Aspect Preview Frame Box */}
          <div
            className={`w-full relative overflow-hidden shadow-2xl flex flex-col justify-between transition-all ${
              aspect === '9:16'
                ? 'max-w-xs aspect-[9/16] rounded-[2.5rem] border-4 border-slate-800 p-6 pt-9 ring-8 ring-black/20'
                : aspect === '1:1'
                ? 'max-w-sm aspect-square rounded-2xl border border-slate-800 p-8'
                : 'max-w-xl aspect-video rounded-2xl border border-slate-800 p-8'
            }`}
            style={{
              background: activeScene.bgFallback || 'linear-gradient(135deg, #0f172a, #1e293b)',
            }}
          >
            {/* Dynamic Island Indicator for 9:16 portrait mobile */}
            {aspect === '9:16' && (
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full border border-white/10 z-20 pointer-events-none flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700 mr-2" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-950/60" />
              </div>
            )}

            {/* Top Scene Role Tag */}
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-white/10 shadow-xs">
                {activeScene.role}
              </span>
              <span className="text-xs font-mono font-bold text-white/80 px-2 py-0.5 rounded-lg bg-black/40 backdrop-blur-xs">
                {activeScene.dur}s
              </span>
            </div>

            {/* Center: Live Headline Display */}
            <div className="text-center relative z-10 px-4 my-auto space-y-3">
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-snug drop-shadow-md">
                {activeScene.sceneTitle || 'Enter scene headline…'}
              </h3>
              {activeScene.sceneDescription && (
                <p className="text-xs sm:text-sm text-slate-200/90 max-w-sm mx-auto font-medium leading-relaxed drop-shadow-xs">
                  {activeScene.sceneDescription}
                </p>
              )}
            </div>

            {/* Bottom Subtitle: Live Voiceover Caption */}
            <div className="relative z-10 text-center">
              <div className="inline-block max-w-md mx-auto px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white/95 text-xs sm:text-sm font-medium italic shadow-lg">
                &ldquo;{activeScene.vo || 'Narration cue...'}&rdquo;
              </div>
            </div>
          </div>

          {/* Stage Controls Under Video */}
          <div className="flex items-center justify-between w-full max-w-xl mt-4 px-2 text-slate-400 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
                disabled={activeIndex === 0}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 cursor-pointer"
                title="Previous Scene"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs font-bold text-slate-300">
                Scene {activeIndex + 1} of {scenes.length}
              </span>
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => Math.min(scenes.length - 1, prev + 1))}
                disabled={activeIndex === scenes.length - 1}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 cursor-pointer"
                title="Next Scene"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span>Total: {totalDuration}s</span>
              <span>•</span>
              <span>1080p High</span>
            </div>
          </div>
        </div>

        {/* Right Scene Inspector (5 Cols) */}
        <div className="lg:col-span-5 p-6 space-y-5 border-t lg:border-t-0 lg:border-l border-slate-200/80 bg-white overflow-y-auto max-h-[580px] scrollbar-thin">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Editing Scene {activeIndex + 1}
              </div>
              <h4 className="font-display font-bold text-base text-slate-900">
                {activeScene.role}
              </h4>
            </div>

            {/* Duration Stepper */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
              <button
                type="button"
                onClick={() => handleDurationChange(-1)}
                className="w-6 h-6 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                title="Decrease duration by 1s"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center font-mono font-bold text-xs text-slate-800">
                {activeScene.dur}s
              </span>
              <button
                type="button"
                onClick={() => handleDurationChange(1)}
                className="w-6 h-6 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                title="Increase duration by 1s"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 1. On-Screen Headline Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-blue-600" />
                <span>On-Screen Headline</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {activeScene.sceneTitle.length} chars
              </span>
            </label>
            <input
              type="text"
              value={activeScene.sceneTitle}
              onChange={(e) => updateActiveScene('sceneTitle', e.target.value)}
              placeholder="e.g. Your next demo shouldn't take a day"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2B59FF]/20 focus:border-[#2B59FF] transition-all"
            />
          </div>

          {/* 2. Voiceover & Spoken Script */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-[#00B4D8]" />
                <span>Voiceover Script (Narrator)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {activeScene.vo.split(/\s+/).filter(Boolean).length} words
              </span>
            </label>
            <textarea
              rows={3}
              value={activeScene.vo}
              onChange={(e) => updateActiveScene('vo', e.target.value)}
              placeholder="e.g. Record with one click and share instantly on any device."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2B59FF]/20 focus:border-[#2B59FF] resize-y transition-all leading-relaxed"
            />
          </div>

          {/* 3. Scene Direction / Visual Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Scene Visual Direction</span>
            </label>
            <textarea
              rows={2}
              value={activeScene.sceneDescription}
              onChange={(e) => updateActiveScene('sceneDescription', e.target.value)}
              placeholder="e.g. Kinetic zoom into browser window with clean drop shadow."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2B59FF]/20 focus:border-[#2B59FF] resize-y transition-all"
            />
          </div>

          {/* 4. AI Assistant for this Scene */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2B59FF]" />
              <span className="font-display font-bold text-xs text-slate-900">
                Ask AI to Update This Scene
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={aiScenePrompt}
                onChange={(e) => setAiScenePrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAiChangeSubmit();
                }}
                placeholder="e.g. “Make headline bolder and speed up pacing”"
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2B59FF]"
              />
              <button
                type="button"
                onClick={handleAiChangeSubmit}
                disabled={!aiScenePrompt.trim() || isSubmitting}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-40 shrink-0"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Filmstrip / Scene Ribbon */}
      <div className="p-4 bg-slate-100/70 border-t border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Timeline Filmstrip ({scenes.length} Scenes)
          </span>
          <span className="text-[11px] font-semibold text-slate-500">
            Click any scene to inspect &amp; edit
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {scenes.map((sc, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={sc.id}
                onClick={() => setActiveIndex(idx)}
                className={`flex-1 min-w-[130px] p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-white border-[#2B59FF] shadow-sm ring-2 ring-[#2B59FF]/20 scale-[1.02]'
                    : 'bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider truncate ${
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  }`}>
                    {sc.role.split('·')[1]?.trim() || `Scene ${idx + 1}`}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {sc.dur}s
                  </span>
                </div>
                <div className="font-display font-bold text-xs text-slate-800 truncate">
                  {sc.sceneTitle}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
