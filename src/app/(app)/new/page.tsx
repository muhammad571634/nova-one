'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Globe, 
  Check, 
  Eye, 
  X, 
  Clock, 
  Mic, 
  Code, 
  Loader2, 
  AlertCircle,
  HelpCircle,
  Film
} from 'lucide-react';
import { STYLE_PRESETS, StylePreset } from '@/lib/presets';
import { generateBriefMarkdown, BriefConfig } from '@/lib/brief';

function NewVideoWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromId = searchParams.get('from');

  // Wizard Step (1, 2, 3)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [url, setUrl] = useState('');
  const [intent, setIntent] = useState<'promote' | 'show_site'>('promote');
  const [stylePreset, setStylePreset] = useState<string>('auto');
  const [length, setLength] = useState<'30s' | '45s' | '60s'>('45s');
  const [voice, setVoice] = useState<'female' | 'male'>('female');
  const [keyMessage, setKeyMessage] = useState('');
  const [aspect, setAspect] = useState<'1920x1080' | '1080x1920' | '1080x1080'>('1920x1080');
  const [captions, setCaptions] = useState<boolean>(true);
  const [brandColor, setBrandColor] = useState<string>('#2B59FF');
  const [brandName, setBrandName] = useState<string>('');

  // UI States
  const [previewPreset, setPreviewPreset] = useState<StylePreset | null>(null);
  const [showBriefPreview, setShowBriefPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [recipeJob, setRecipeJob] = useState<{ id: string; slug: string; preset: string; aspect: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user && typeof data.user.balance === 'number') {
          setBalance(data.user.balance);
        }
      })
      .catch(() => {});
  }, []);

  // F10: Load Recipe if 'from' query param exists
  useEffect(() => {
    if (!fromId) return;
    fetch(`/api/jobs/${fromId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.job?.briefConfig) {
          const bc = data.job.briefConfig;
          if (bc.stylePreset) setStylePreset(bc.stylePreset);
          if (bc.length) setLength(bc.length);
          if (bc.voice) setVoice(bc.voice);
          if (bc.intent) setIntent(bc.intent);
          if (bc.aspect) setAspect(bc.aspect);
          if (typeof bc.captions === 'boolean') setCaptions(bc.captions);
          if (bc.brandColor) setBrandColor(bc.brandColor);
          if (bc.brandName) setBrandName(bc.brandName);
          setRecipeJob({
            id: data.job.id,
            slug: data.job.slug,
            preset: bc.stylePreset || 'auto',
            aspect: bc.aspect || '1920x1080',
          });
        }
      })
      .catch((err) => {
        console.warn('Failed to load recipe job:', err);
      });
  }, [fromId]);

  // Quick suggestions
  const sampleUrls = [
    'https://linear.app',
    'https://resend.com',
    'https://cal.com',
  ];

  const currentBriefConfig: BriefConfig = {
    url: url || 'https://example.com',
    intent,
    stylePreset,
    length,
    voice,
    language: 'en',
    keyMessage,
    aspect,
    captions,
    brandColor,
    brandName,
  };

  const briefMarkdown = generateBriefMarkdown(currentBriefConfig);

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url || !url.startsWith('http')) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }
    setError(null);
    setStep(2);
  }

  async function handleFinalSubmit() {
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          intent,
          stylePreset,
          length,
          voice,
          language: 'en',
          keyMessage,
          aspect,
          captions,
          brandColor,
          brandName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create video job.');
      }

      router.push(`/projects/${data.jobId}`);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header & Stepper */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </Link>
          <button
            type="button"
            onClick={() => setShowBriefPreview(!showBriefPreview)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0096C7] hover:text-[#0077B6] transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showBriefPreview ? 'Hide BRIEF.md' : 'Preview BRIEF.md'}</span>
          </button>
        </div>

        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900">
            Create New Launch Video
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Step {step} of 3 — {step === 1 ? 'Target Website' : step === 2 ? 'Visual Aesthetic' : 'Video Settings & Voice'}
          </p>
        </div>

        {/* F8: Zero Balance Warning Banner */}
        {balance !== null && balance < 1 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/70 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-display font-bold text-xs sm:text-sm text-amber-950">
                  0 Video Credits Remaining
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Your free video generation quota is exhausted. Upgrade your plan to start new videos.
                </p>
              </div>
            </div>
            <Link
              href="/billing"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Upgrade Plan</span>
            </Link>
          </div>
        )}

        {/* F10: Active Recipe Banner */}
        {recipeJob && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-transparent border border-cyan-300/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#0096C7] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                  <span>Recipe Active:</span>
                  <span className="text-[#0077B6] font-extrabold">{recipeJob.slug}</span>
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Pre-filled style preset <span className="font-semibold text-slate-800">({recipeJob.preset})</span>, voice, and <span className="font-semibold text-slate-800">{recipeJob.aspect}</span>. Enter your website URL below!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRecipeJob(null)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors shrink-0 cursor-pointer"
            >
              Clear Recipe
            </button>
          </div>
        )}

        {/* Capsule Progress Bar */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <button
            onClick={() => setStep(1)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              step === 1
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>1. Website</span>
            {url && step > 1 && <Check className="w-3 h-3 text-[#00C2FF]" />}
          </button>

          <button
            onClick={() => url && setStep(2)}
            disabled={!url}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 ${
              step === 2
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>2. Style Preset</span>
            {step > 2 && <Check className="w-3 h-3 text-[#00C2FF]" />}
          </button>

          <button
            onClick={() => url && setStep(3)}
            disabled={!url}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 ${
              step === 3
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>3. Settings</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Source & Intent */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Website or Landing Page URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourproduct.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/30 focus:border-[#00B4D8] focus:bg-white transition-all font-mono"
              />
            </div>

            {/* Quick Suggestions */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400">Try sample:</span>
              {sampleUrls.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => setUrl(sample)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200/70 text-slate-600 font-mono transition-colors"
                >
                  {sample.replace('https://', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Video Intent */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Video Objective & Narrative Angle
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setIntent('promote')}
                className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                  intent === 'promote'
                    ? 'border-[#00B4D8] bg-cyan-50/30 ring-2 ring-[#00C2FF]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-bold text-sm text-slate-900">
                    Promote the product
                  </span>
                  {intent === 'promote' && (
                    <div className="w-4 h-4 rounded-full bg-[#00B4D8] text-white flex items-center justify-center text-[10px]">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Focus on value proposition, problems solved, and customer conversion. Recommended for launches.
                </p>
              </div>

              <div
                onClick={() => setIntent('show_site')}
                className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                  intent === 'show_site'
                    ? 'border-[#00B4D8] bg-cyan-50/30 ring-2 ring-[#00C2FF]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-bold text-sm text-slate-900">
                    Show the site as-is
                  </span>
                  {intent === 'show_site' && (
                    <div className="w-4 h-4 rounded-full bg-[#00B4D8] text-white flex items-center justify-center text-[10px]">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Direct tour showcasing the actual UI layouts, features, and interface screens.
                </p>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!url}
              className="py-3 px-6 rounded-xl bg-[#0F172A] hover:bg-slate-800 active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>Next: Choose Visual Style</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Style Presets */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900">
              Select a Motion Design Aesthetic
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose from 13 verified HyperFrames style presets or let the AI extract design tokens automatically.
            </p>
          </div>

          {/* Presets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STYLE_PRESETS.map((preset) => {
              const isSelected = stylePreset === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setStylePreset(preset.id)}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all flex flex-col justify-between relative group ${
                    isSelected
                      ? 'border-[#00B4D8] bg-cyan-50/20 ring-2 ring-[#00C2FF]/30 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display font-bold text-sm text-slate-900">
                        {preset.name}
                      </span>
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-[#00B4D8] text-white flex items-center justify-center text-[10px]">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          {preset.colors.map((c, i) => (
                            <div
                              key={i}
                              className="w-2.5 h-2.5 rounded-full border border-slate-300/40"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 leading-snug line-clamp-2">
                      {preset.tagline}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {preset.vibe}
                    </span>

                    {!preset.isAuto && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewPreset(preset);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-[#0096C7] hover:bg-cyan-50 transition-colors"
                        title="Live Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="py-3 px-6 rounded-xl bg-[#0F172A] hover:bg-slate-800 active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>Next: Settings & Voice</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Settings & Audio */}
      {step === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Target Length */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#00B4D8]" />
              <span>Target Duration</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['30s', '45s', '60s'] as const).map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => setLength(len)}
                  className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border text-center ${
                    length === len
                      ? 'border-[#00B4D8] bg-cyan-50/40 text-slate-900 ring-2 ring-[#00C2FF]/20'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="block text-base font-display tabular-nums mb-0.5">{len}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {len === '30s' ? 'Quick Teaser' : len === '45s' ? 'Standard Launch' : 'Deep Dive'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Studio Voiceover */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-[#00B4D8]" />
              <span>Studio Voice Narration (HeyGen)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVoice('female')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  voice === 'female'
                    ? 'border-[#00B4D8] bg-cyan-50/40 ring-2 ring-[#00C2FF]/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-bold text-sm text-slate-900">Female Voice</span>
                  {voice === 'female' && <Check className="w-3.5 h-3.5 text-[#00B4D8]" />}
                </div>
                <p className="text-xs text-slate-500">Energetic, clean, and confident startup tone</p>
              </button>

              <button
                type="button"
                onClick={() => setVoice('male')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  voice === 'male'
                    ? 'border-[#00B4D8] bg-cyan-50/40 ring-2 ring-[#00C2FF]/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-bold text-sm text-slate-900">Male Voice</span>
                  {voice === 'male' && <Check className="w-3.5 h-3.5 text-[#00B4D8]" />}
                </div>
                <p className="text-xs text-slate-500">Warm, authoritative, and articulate tech tone</p>
              </button>
            </div>
          </div>

          {/* Key Message (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Key Marketing Message / Core Takeaway (Optional)
            </label>
            <input
              type="text"
              value={keyMessage}
              onChange={(e) => setKeyMessage(e.target.value)}
              placeholder="e.g. Ship launch videos in an afternoon"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/30 focus:border-[#00B4D8] focus:bg-white transition-all"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Leave empty to let the AI derive the primary value proposition directly from your website.
            </p>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Aspect Ratio</span>
              <span className="text-[11px] text-slate-400 font-normal lowercase">Choose video frame geometry</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { ratio: '1920x1080' as const, label: '16:9 Landscape', sub: 'YouTube, Web & Desktop' },
                { ratio: '1080x1920' as const, label: '9:16 Portrait', sub: 'TikTok, Reels & Shorts' },
                { ratio: '1080x1080' as const, label: '1:1 Square', sub: 'Instagram & Feed Posts' },
              ].map((item) => (
                <button
                  key={item.ratio}
                  type="button"
                  onClick={() => setAspect(item.ratio)}
                  className={`py-3 px-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    aspect === item.ratio
                      ? 'border-[#00B4D8] bg-cyan-50/40 ring-2 ring-[#00C2FF]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-display font-bold text-sm text-slate-900">{item.label}</span>
                    {aspect === item.ratio && <Check className="w-3.5 h-3.5 text-[#00B4D8]" />}
                  </div>
                  <p className="text-[11px] text-slate-500">{item.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Captions & Brand Token */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Captions Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Subtitle Captions
              </label>
              <button
                type="button"
                onClick={() => setCaptions(!captions)}
                className={`w-full py-3 px-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  captions
                    ? 'border-[#00B4D8] bg-cyan-50/40 ring-2 ring-[#00C2FF]/20'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="font-display font-bold text-sm text-slate-900">
                    Captions {captions ? 'Enabled' : 'Disabled'}
                  </div>
                  <p className="text-xs text-slate-500">
                    {captions ? 'Dynamic karaoke subtitles burned into video' : 'No subtitles will be rendered'}
                  </p>
                </div>
                <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${captions ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                  {captions ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            {/* Brand Accent Color */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Brand Accent Color</span>
                <span className="font-mono text-[11px] text-slate-400">{brandColor}</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value.toUpperCase())}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5"
                  title="Choose brand color"
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-sky-500 uppercase"
                  placeholder="#2B59FF"
                />
              </div>
            </div>
          </div>

          {/* Navigation & Submit */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] hover:from-slate-800 hover:to-slate-900 active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2.5 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#00C2FF]" />
                  <span>Creating Job & BRIEF.md…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#00C2FF]" />
                  <span>Generate Video (1 Credit)</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* BRIEF.md Live Inspector Drawer */}
      {showBriefPreview && (
        <div className="rounded-2xl border border-slate-200/90 bg-slate-900 text-slate-200 p-5 shadow-inner space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-[#00C2FF]" />
              <span className="font-mono text-xs font-bold text-slate-300">Generated BRIEF.md Preview</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">HyperFrames Contract v0.8.46</span>
          </div>
          <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap overflow-x-auto max-h-72 p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
            {briefMarkdown}
          </pre>
        </div>
      )}

      {/* Preset Live Preview Modal */}
      {previewPreset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-slate-50/50">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  {previewPreset.name} Showcase
                </h3>
                <p className="text-xs text-slate-500">{previewPreset.tagline}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStylePreset(previewPreset.id);
                    setPreviewPreset(null);
                  }}
                  className="py-1.5 px-3 rounded-lg bg-[#0F172A] text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Select This Style
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPreset(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 relative min-h-[450px]">
              <iframe
                src={`/api/presets/${previewPreset.id}/preview`}
                title={`${previewPreset.name} Preview`}
                className="w-full h-full min-h-[450px] border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewVideoWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
          <p className="text-xs font-semibold">Loading video wizard…</p>
        </div>
      }
    >
      <NewVideoWizardContent />
    </Suspense>
  );
}