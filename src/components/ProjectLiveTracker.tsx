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
  Sliders, 
  Plus, 
  Minus, 
  Maximize2,
  ArrowRight,
  Globe,
  Volume2,
  Share2,
  Copy,
  CheckCheck,
  Zap,
  Lock,
  CreditCard,
  Shield,
  Code
} from 'lucide-react';
import { ParsedStoryboard } from '@/lib/storyboard-parser';
import SimpleVisualEditor from './SimpleVisualEditor';

// Direction C Canonical Template Showcases (Exact specs from c-canvas.html)
const TEMPLATE_PRESETS = [
  {
    id: '01',
    templateTitle: 'Ads & Promo',
    defaultTitle: "Your next demo shouldn't take a day",
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
    bgFallback: 'linear-gradient(145deg, #D47355, #8C3E26)',
    role: '01 · Hook',
    defaultVo: "Recording a product demo shouldn't eat your whole afternoon.",
    defaultDur: 5
  },
  {
    id: '02',
    templateTitle: 'Educational Video',
    defaultTitle: 'Slow tools, heavy files, closed platforms',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1000&q=85',
    bgFallback: 'linear-gradient(145deg, #B58A6A, #66432A)',
    role: '02 · Problem',
    defaultVo: 'Most screen recorders are slow, bloated, and lock your videos away.',
    defaultDur: 7
  },
  {
    id: '03',
    templateTitle: 'Expert Explainer',
    defaultTitle: (brand: string) => `Meet ${brand}`,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=85',
    bgFallback: 'linear-gradient(145deg, #3E6B52, #1C3326)',
    role: '03 · Solution',
    defaultVo: (brand: string) => `Meet ${brand} — the modern way to build and ship software fast.`,
    defaultDur: 8
  },
  {
    id: '04',
    templateTitle: 'Tips & How-To',
    defaultTitle: 'Stop recording — the link is ready',
    image: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=1000&q=85',
    bgFallback: 'linear-gradient(145deg, #A8988A, #574B40)',
    role: '04 · Feature',
    defaultVo: 'Hit stop, and your video is instantly ready on your clipboard.',
    defaultDur: 9
  },
  {
    id: '05',
    templateTitle: 'News Brief Video',
    defaultTitle: 'Open source. Your recordings, your storage.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=85',
    bgFallback: 'linear-gradient(145deg, #2D4D7A, #122135)',
    role: '05 · Proof',
    defaultVo: "It's built for speed, security, and total developer control.",
    defaultDur: 8
  },
  {
    id: '06',
    templateTitle: 'Video Podcast',
    defaultTitle: 'Start building for free',
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1000&q=85',
    bgFallback: 'linear-gradient(145deg, #282A32, #0E0F12)',
    role: '06 · CTA',
    defaultVo: (brand: string) => `Get started with ${brand} today.`,
    defaultDur: 6
  }
];

// HeyGen-Grade Minimalist Vector Icons (Crisp, Bold, Apple/HeyGen aesthetics)
function HeygenClockIcon({ className = 'w-4.5 h-4.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.5" />
      <polyline points="12 6.5 12 12 15.5 13.5" />
    </svg>
  );
}

function HeygenAspectIcon({ className = 'w-4.5 h-4.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="3.5" />
      <path d="M7 9h2V7" />
      <path d="M17 9h-2V7" />
      <path d="M7 15h2v2" />
      <path d="M17 15h-2v2" />
    </svg>
  );
}

function HeygenCaptionsIcon({ className = 'w-4.5 h-4.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
      <path d="M8.5 10.5a2 2 0 1 0 0 3" />
      <path d="M15.5 10.5a2 2 0 1 0 0 3" />
    </svg>
  );
}

function HeygenVoiceIcon({ className = 'w-4.5 h-4.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 5a10 10 0 0 1 0 14" />
    </svg>
  );
}

function HeygenStyleIcon({ className = 'w-4.5 h-4.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" />
      <path d="M20 15l-4.5-4.5a2 2 0 0 0-2.8 0L4 19" />
    </svg>
  );
}

function HeygenTargetIcon({ className = 'w-4.5 h-4.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function HeygenPlusIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function HeygenChevronIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function HeygenCheckCircle({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <div className={`${className} rounded-full border-[1.5px] border-[#00B4D8] flex items-center justify-center shrink-0`}>
      <Check className="w-2.5 h-2.5 text-[#00B4D8] stroke-[3]" />
    </div>
  );
}

// Modern Minimalist Prompt Ideas — Proven high-converting prompts that HyperFrames AI agent directly utilizes
const PROMPT_IDEAS = [
  {
    id: 'fast_paced',
    label: 'Fast-paced & punchy cuts',
    prompt: 'Fast-paced & punchy cuts with high-energy transitions.',
  },
  {
    id: 'step_by_step',
    label: 'Explain features step-by-step',
    prompt: 'Explain core features step-by-step with clear visual benefits.',
  },
  {
    id: 'dark_mode',
    label: 'Dark mode & neon glow',
    prompt: 'Sleek dark mode interface with neon glow accents and high contrast.',
  },
  {
    id: 'conversion',
    label: 'Problem-first & high conversion',
    prompt: 'Hook with core pain points, immediate solution, and strong CTA.',
  },
  {
    id: 'typography',
    label: 'Bold kinetic typography',
    prompt: 'Bold kinetic typography with large stats and crisp callouts.',
  },
  {
    id: 'dev_first',
    label: 'Developer-first & API showcase',
    prompt: 'Developer-first presentation highlighting fast workflow, code, and speed.',
  },
];

// Formats frame type into a concise, professional badge (e.g. "01 · Hook", "07 · CTA")
function formatRoleLabel(type?: string, fallbackRole?: string, cardId: string = '01'): string {
  if (type) {
    const map: Record<string, string> = {
      hook: 'Hook',
      intro: 'Intro',
      product_intro: 'Intro',
      feature: 'Feature',
      feature_showcase: 'Feature',
      benefits: 'Benefits',
      benefit_highlight: 'Benefits',
      proof: 'Proof',
      cta: 'CTA',
    };
    const mapped = map[type.toLowerCase().trim()];
    if (mapped) return `${cardId} · ${mapped}`;
  }
  if (fallbackRole) {
    const cleanRole = fallbackRole.replace(/^\d+\s*·\s*/, '').trim();
    return `${cardId} · ${cleanRole}`;
  }
  return `${cardId} · Scene`;
}

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
  hasRenderedVideo?: boolean;
  videoSizeBytes?: number;
  hasContactSheet?: boolean;
  renderRecord?: any;
  agentRuns?: any[];
  userBalance?: number;
}

export default function ProjectLiveTracker({
  jobId,
  slug,
  sourceUrl,
  initialStatus,
  briefConfig,
  briefMarkdown,
  initialStoryboard,
  hasRenderedVideo = false,
  videoSizeBytes = 0,
  hasContactSheet = false,
  renderRecord = null,
  agentRuns = [],
  userBalance = 5,
}: ProjectLiveTrackerProps) {
  const [status, setStatus] = useState(initialStatus);
  const [balance, setBalance] = useState<number>(userBalance);
  const [isMockUpgradeModalOpen, setIsMockUpgradeModalOpen] = useState(false);
  const [isUpgradingInModal, setIsUpgradingInModal] = useState(false);
  const [modalUpgradeError, setModalUpgradeError] = useState<string | null>(null);
  const [modalUpgradeSuccess, setModalUpgradeSuccess] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeShareTab, setActiveShareTab] = useState<'link' | 'embed' | 'iframe' | 'script'>('link');
  const [copiedShareItem, setCopiedShareItem] = useState<string | null>(null);
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
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isBriefOpen, setIsBriefOpen] = useState(false);
  const [storyboard, setStoryboard] = useState<ParsedStoryboard | null>(initialStoryboard || null);

  // Direction C View Mode: 'templates' | 'scenes' | 'editor'
  const [currentMode, setCurrentMode] = useState<'templates' | 'scenes' | 'editor'>('scenes');

  // Direction C Comments State: cardId -> comment text
  const [comments, setComments] = useState<Record<string, string>>({});
  const [draftComments, setDraftComments] = useState<Record<string, string>>({});
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  // Floating Composer Global Input
  const [globalFeedback, setGlobalFeedback] = useState('');

  // Frame custom durations state: cardId -> number (seconds)
  const [frameSeconds, setFrameSeconds] = useState<Record<string, number>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Brief Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUrl, setEditUrl] = useState(briefConfig?.url || sourceUrl || '');
  const [editKeyMessage, setEditKeyMessage] = useState(briefConfig?.keyMessage || '');
  const [editStylePreset, setEditStylePreset] = useState(briefConfig?.stylePreset || 'auto');
  const [editLength, setEditLength] = useState(briefConfig?.length || '45s');
  const [editVoice, setEditVoice] = useState(briefConfig?.voice || 'female');
  const [editIntent, setEditIntent] = useState(briefConfig?.intent || 'promote');
  const [editAspect, setEditAspect] = useState<'16:9' | '9:16' | '1:1'>(() => {
    const raw = briefConfig?.aspect || initialStoryboard?.format;
    if (raw === '9:16' || raw === '1080x1920') return '9:16';
    if (raw === '1:1' || raw === '1080x1080') return '1:1';
    return '16:9';
  });
  const [editCaptions, setEditCaptions] = useState<boolean>(briefConfig?.captions !== false);
  const [editBrandColor, setEditBrandColor] = useState<string>(briefConfig?.brandColor || '#2B59FF');
  const [editBrandName, setEditBrandName] = useState<string>(briefConfig?.brandName || '');

  // Synchronize editAspect if storyboard arrives with format frontmatter
  useEffect(() => {
    if (storyboard?.format) {
      const f = storyboard.format;
      if (f === '9:16' || f === '1080x1920') setEditAspect('9:16');
      else if (f === '1:1' || f === '1080x1080') setEditAspect('1:1');
      else if (f === '16:9' || f === '1920x1080') setEditAspect('16:9');
    }
  }, [storyboard?.format]);

  // F7: Studio & Edit States
  const [isStudioLoading, setIsStudioLoading] = useState(false);
  const [studioInfo, setStudioInfo] = useState<{ isRunning: boolean; url?: string; port?: number } | null>(null);
  const [editChangeText, setEditChangeText] = useState('');

  // Check Studio status on load
  useEffect(() => {
    let isMounted = true;
    const checkStudio = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}/studio`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setStudioInfo(data);
        }
      } catch {}
    };
    checkStudio();
    return () => {
      isMounted = false;
    };
  }, [jobId]);

  const handleOpenStudio = async () => {
    setIsStudioLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/studio`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStudioInfo(data);
        if (data.url) {
          window.open(data.url, '_blank', 'noopener,noreferrer');
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to start HyperFrames Studio');
      }
    } catch {
      alert('Network error starting HyperFrames Studio');
    } finally {
      setIsStudioLoading(false);
    }
  };

  const handleStopStudio = async () => {
    try {
      await fetch(`/api/jobs/${jobId}/studio`, { method: 'DELETE' });
      setStudioInfo({ isRunning: false });
    } catch {}
  };

  const copyShareContent = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedShareItem(label);
    setTimeout(() => setCopiedShareItem(null), 2000);
  };

  // Dropdown / Popover states for option chips
  const [isLengthMenuOpen, setIsLengthMenuOpen] = useState(false);
  const [isAspectMenuOpen, setIsAspectMenuOpen] = useState(false);
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [isBrandSystemOpen, setIsBrandSystemOpen] = useState(false);
  const [isVoiceMenuOpen, setIsVoiceMenuOpen] = useState(false);
  const [isIntentMenuOpen, setIsIntentMenuOpen] = useState(false);

  const closeAllMenus = () => {
    setIsLengthMenuOpen(false);
    setIsAspectMenuOpen(false);
    setIsStyleMenuOpen(false);
    setIsBrandSystemOpen(false);
    setIsVoiceMenuOpen(false);
    setIsIntentMenuOpen(false);
  };

  useEffect(() => {
    if (briefConfig) {
      if (briefConfig.url !== undefined) setEditUrl(briefConfig.url || sourceUrl || '');
      if (briefConfig.keyMessage !== undefined) setEditKeyMessage(briefConfig.keyMessage || '');
      if (briefConfig.stylePreset !== undefined) setEditStylePreset(briefConfig.stylePreset || 'auto');
      if (briefConfig.length !== undefined) setEditLength(briefConfig.length || '45s');
      if (briefConfig.voice !== undefined) setEditVoice(briefConfig.voice || 'female');
      if (briefConfig.intent !== undefined) setEditIntent(briefConfig.intent || 'promote');
      if (briefConfig.aspect) {
        setEditAspect(
          briefConfig.aspect === '9:16' || briefConfig.aspect === '1080x1920'
            ? '9:16'
            : briefConfig.aspect === '1:1' || briefConfig.aspect === '1080x1080'
            ? '1:1'
            : '16:9'
        );
      }
      if (briefConfig.captions !== undefined) setEditCaptions(briefConfig.captions !== false);
      if (briefConfig.brandColor) setEditBrandColor(briefConfig.brandColor);
      if (briefConfig.brandName) setEditBrandName(briefConfig.brandName);
    }
  }, [briefConfig, sourceUrl]);

  // Clean industry-standard body scroll lock to prevent background page from scrolling
  useEffect(() => {
    if (isEditModalOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isEditModalOpen]);

  const logsEndRef = useRef<HTMLDivElement | null>(null);

  // Helper: brand name capitalization
  const brandName = slug
    ? slug.split('-')[0].charAt(0).toUpperCase() + slug.split('-')[0].slice(1)
    : 'Product';

  // Helper to parse seconds from string like "0:00 - 0:08 (8s)", "8s", or decimal "6.243s"
  const parseDurationSeconds = (raw: string): number => {
    if (!raw) return 6;
    const match = raw.match(/([\d.]+)\s*s\b/i);
    if (match) {
      const sec = parseFloat(match[1]);
      if (!isNaN(sec) && sec > 0) return Math.round(sec);
    }
    const rangeMatch = raw.match(/:(\d{2})\s*-\s*\d+:(\d{2})/);
    if (rangeMatch) {
      const diff = parseInt(rangeMatch[2], 10) - parseInt(rangeMatch[1], 10);
      if (diff > 0) return diff;
    }
    const plainNum = parseFloat(raw);
    if (!isNaN(plainNum) && plainNum > 0) return Math.round(plainNum);
    return 6;
  };

  const formatBytes = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const totalCostUsd = agentRuns.reduce((acc, run) => acc + (run.total_cost_usd || 0), 0);
  const totalTokens = agentRuns.reduce(
    (acc, run) => acc + ((run.input_tokens || 0) + (run.output_tokens || 0) + (run.cache_read_tokens || 0)),
    0
  );

  const handleDurationDelta = (cardId: string, currentSeconds: number, delta: number) => {
    const updated = Math.max(1, Math.min(30, currentSeconds + delta));
    setFrameSeconds((prev) => ({ ...prev, [cardId]: updated }));

    // Sync duration delta into draft comments
    setDraftComments((prev) => {
      const existing = prev[cardId] || comments[cardId] || '';
      const cleanNote = existing.replace(/\[Duration:\s*\d+s\]\s*/g, '').trim();
      const updatedNote = `[Duration: ${updated}s] ${cleanNote}`.trim();
      return { ...prev, [cardId]: updatedNote };
    });
  };

  const handleModalUpgrade = async (plan: 'pro' | 'team' = 'pro') => {
    setIsUpgradingInModal(true);
    setModalUpgradeError(null);
    try {
      const res = await fetch('/api/billing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upgrade plan');
      }
      setBalance(data.balance);
      setModalUpgradeSuccess(`Upgraded to ${data.plan === 'team' ? 'Team' : 'Pro'}! Active balance: ${data.balance} credits.`);
      setTimeout(() => {
        setIsMockUpgradeModalOpen(false);
        setModalUpgradeSuccess(null);
      }, 1200);
    } catch (err: unknown) {
      setModalUpgradeError(err instanceof Error ? err.message : 'Upgrade failed');
    } finally {
      setIsUpgradingInModal(false);
    }
  };

  const handleAction = async (
    action: 'revise' | 'build' | 'render' | 'cancel' | 'restart' | 'edit_brief' | 'edit',
    customPayload?: any
  ) => {
    if (action === 'render' && balance < 1) {
      setIsMockUpgradeModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      let payload = customPayload;
      if (!payload) {
        if (action === 'revise') {
          payload = { 
            comments: { 
              ...comments, 
              ...(globalFeedback.trim() ? { global: globalFeedback.trim() } : {}) 
            } 
          };
        } else if (action === 'edit') {
          payload = {
            instruction: (editChangeText || globalFeedback).trim()
          };
        } else if (action === 'edit_brief') {
          payload = {
            url: editUrl,
            keyMessage: editKeyMessage,
            stylePreset: editStylePreset,
            length: editLength,
            voice: editVoice,
            intent: editIntent,
            aspect: editAspect === '9:16' ? '1080x1920' : editAspect === '1:1' ? '1080x1080' : '1920x1080',
            captions: editCaptions,
            brandColor: editBrandColor,
            brandName: editBrandName,
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

      if (res.status === 402) {
        setBalance(0);
        setIsMockUpgradeModalOpen(true);
        const err = await res.json();
        alert(err.error || 'Insufficient video credits. Please upgrade your plan.');
        return;
      }

      if (res.ok) {
        if (action === 'render') {
          setBalance((b) => Math.max(0, b - 1));
        }
        if (action === 'revise' || action === 'edit') {
          setComments({});
          setDraftComments({});
          setGlobalFeedback('');
          setEditChangeText('');
          setOpenCardId(null);
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

  // Dynamic Browser Tab Title
  useEffect(() => {
    if (status === 'planning' || status === 'preparing') {
      document.title = `(● ${milestones.percentage}%) Planning ${brandName} · Nova One`;
    } else if (status === 'building' || status === 'queued_building') {
      document.title = `(● ${milestones.percentage}%) Assembling ${brandName} · Nova One`;
    } else if (status === 'editing' || status === 'queued_editing') {
      document.title = `(●) Editing ${brandName} · Nova One`;
    } else if (status === 'rendering' || status === 'queued_rendering') {
      document.title = `(●) Rendering MP4 · Nova One`;
    } else if (status === 'awaiting_approval') {
      document.title = `(✓) Storyboard Ready! · Nova One`;
    } else if (status === 'awaiting_render') {
      document.title = `(✓) Ready to Render · Nova One`;
    } else if (status === 'done') {
      document.title = `(✓) Video Ready! · Nova One`;
    } else if (status === 'cancelled') {
      document.title = `(⏹) Stopped · Nova One`;
    } else if (status === 'failed') {
      document.title = `(✕) Failed · Nova One`;
    } else {
      document.title = `${brandName} — Launch Video · Nova One`;
    }
  }, [status, milestones.percentage, brandName]);

  // Map Storyboard Frames or Showcase Fallback Cards
  const cardItems = (storyboard?.frames && storyboard.frames.length > 0)
    ? storyboard.frames.map((fr, idx) => {
        const preset = TEMPLATE_PRESETS[idx % TEMPLATE_PRESETS.length];
        const cardId = String(fr.id).padStart(2, '0');
        const dur = frameSeconds[cardId] ?? parseDurationSeconds(fr.duration);
        const roleLabel = formatRoleLabel(fr.type, preset.role, cardId);
        return {
          id: cardId,
          numericId: fr.id,
          templateTitle: preset.templateTitle,
          sceneTitle: fr.title || (typeof preset.defaultTitle === 'function' ? preset.defaultTitle(brandName) : preset.defaultTitle),
          role: roleLabel,
          sceneDescription: fr.scene || '',
          vo: fr.voiceover || (typeof preset.defaultVo === 'function' ? preset.defaultVo(brandName) : preset.defaultVo),
          dur,
          image: preset.image,
          bgFallback: preset.bgFallback
        };
      })
    : TEMPLATE_PRESETS.map((t) => {
        const title = typeof t.defaultTitle === 'function' ? t.defaultTitle(brandName) : t.defaultTitle;
        const vo = typeof t.defaultVo === 'function' ? t.defaultVo(brandName) : t.defaultVo;
        const dur = frameSeconds[t.id] ?? t.defaultDur;
        return {
          id: t.id,
          numericId: parseInt(t.id, 10),
          templateTitle: t.templateTitle,
          sceneTitle: title,
          role: t.role,
          sceneDescription: '',
          vo,
          dur,
          image: t.image,
          bgFallback: t.bgFallback
        };
      });

  const totalDurationSec = cardItems.reduce((acc, c) => acc + c.dur, 0);

  // The One Message
  const theOneMessage = briefConfig?.keyMessage || storyboard?.message || `Beautiful screen recordings, shared in seconds.`;

  // Brand Palette Swatches (matching Image 2)
  const paletteSwatches = ['#0E1116', '#F4F5F7', '#2B59FF', '#C9D3E6'];

  // Comments Count (per-scene + global composer)
  const commentCount = Object.values(comments).filter((v) => v.trim()).length + (globalFeedback.trim() ? 1 : 0);

  return (
    <div className="space-y-7 pb-28 min-h-screen">
      {/* Top Header matching c-canvas.html */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Link href="/projects" className="hover:text-slate-700 transition-colors inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Projects</span>
            </Link>
            <span>/</span>
            <span className="text-slate-600">{brandName}</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-slate-900 leading-tight">
            {brandName} — <span className="gradient-text">launch video</span>
          </h1>

          <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#2B59FF] bg-[#EEF2FF] px-3 py-1 rounded-full border border-blue-100/70 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#2B59FF] shadow-[0_0_0_3px_rgba(43,89,255,0.22)]" />
            <span>
              {status === 'awaiting_approval'
                ? 'Your storyboard is ready'
                : status === 'planning'
                ? 'Agent generating storyboard…'
                : status === 'cancelled'
                ? 'Generation stopped'
                : status === 'building' || status === 'queued_building'
                ? 'Assembling video…'
                : status === 'revising' || status === 'queued_revising'
                ? 'Applying your comments…'
                : status === 'editing' || status === 'queued_editing'
                ? 'Applying video edit…'
                : status === 'awaiting_render'
                ? 'Ready to render'
                : status === 'rendering' || status === 'queued_rendering'
                ? 'Rendering 1080p MP4…'
                : status === 'done'
                ? 'Video ready'
                : status === 'failed'
                ? 'Generation failed'
                : 'Your storyboard is ready'}
            </span>
          </div>
        </div>

        {/* Action Buttons Top Right */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {['queued', 'preparing', 'planning', 'building', 'revising', 'editing', 'rendering'].includes(status) && (
            <button
              type="button"
              onClick={() => handleAction('cancel')}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/90 border border-rose-200 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Square className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
              <span>{isSubmitting ? 'Stopping…' : 'Stop Agent'}</span>
            </button>
          )}

          {/* F7: HyperFrames Studio Button */}
          {studioInfo?.isRunning ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <a
                href={studioInfo.url}
                target="_blank"
                rel="noreferrer"
                className="hover:underline inline-flex items-center gap-1"
                title="Open Studio in new tab"
              >
                <span>Studio :{studioInfo.port}</span>
                <ExternalLink className="w-3 h-3 text-emerald-600" />
              </a>
              <button
                type="button"
                onClick={handleStopStudio}
                className="w-4 h-4 rounded-full hover:bg-emerald-200/80 text-emerald-800 flex items-center justify-center transition-colors ml-0.5 cursor-pointer"
                title="Stop Studio Preview Server"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpenStudio}
              disabled={isStudioLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 transition-all shadow-2xs cursor-pointer disabled:opacity-60"
              title="Open HyperFrames Studio Visual Timeline Editor"
            >
              {isStudioLoading ? (
                <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              ) : (
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{isStudioLoading ? 'Starting…' : 'Open in Studio'}</span>
            </button>
          )}

          <Link
            href={`/new?from=${jobId}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all shadow-2xs cursor-pointer"
            title="Create another video using this visual style and voice settings"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Use as Recipe</span>
          </Link>

          {(status === 'done' || hasRenderedVideo) && (
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-cyan-900 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-all shadow-2xs cursor-pointer"
              title="Share or embed this video"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-600" />
              <span>Share &amp; Embed</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 transition-all shadow-2xs cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Brief</span>
          </button>

          {/* Secondary Approve & Build button if comments are queued */}
          {commentCount > 0 && (
            <button
              type="button"
              onClick={() => handleAction('build')}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <span>Approve &amp; build</span>
            </button>
          )}

          {/* Primary Action Button (Morphs to Render, Send Comments, or Approve & Build) */}
          <button
            type="button"
            onClick={() => {
              if (status === 'awaiting_render') {
                handleAction('render');
              } else if (status === 'done') {
                const downloadUrl = `/api/jobs/${jobId}/files/renders/video.mp4?download=true`;
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = 'video.mp4';
                a.click();
              } else if (commentCount > 0) {
                handleAction('revise');
              } else {
                handleAction('build');
              }
            }}
            disabled={isSubmitting || status === 'rendering' || status === 'queued_rendering'}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2B59FF] to-[#1A46E8] hover:from-[#1A46E8] hover:to-[#0F35C8] shadow-[0_6px_20px_rgba(43,89,255,0.32)] transition-all cursor-pointer disabled:opacity-50"
          >
            {status === 'done' ? (
              <Download className="w-4 h-4" />
            ) : status === 'awaiting_render' ? (
              <Play className="w-4 h-4 fill-white" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>
              {isSubmitting
                ? 'Processing…'
                : status === 'awaiting_render'
                ? 'Render Video (MP4)'
                : status === 'done'
                ? 'Download MP4'
                : commentCount > 0
                ? `Send ${commentCount} comment${commentCount > 1 ? 's' : ''}`
                : 'Approve & build'}
            </span>
          </button>
        </div>
      </div>

      {/* Cancelled / Failed Banner */}
      {(status === 'cancelled' || status === 'failed') && (
        <div
          className={`rounded-3xl p-5 shadow-xs border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300 ${
            status === 'cancelled'
              ? 'bg-amber-50/80 border-amber-200 text-amber-950'
              : 'bg-rose-50/80 border-rose-200 text-rose-950'
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
              <h3 className="font-display font-bold text-sm">
                {status === 'cancelled' ? 'Agent Generation Stopped' : 'Generation Halted'}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {status === 'cancelled'
                  ? 'Run is paused. You can review and comment on scenes below, edit instructions, or restart.'
                  : error || 'An error occurred during agent processing.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-[#00C2FF]" />
              <span>Edit Brief</span>
            </button>
            <button
              type="button"
              onClick={() => handleAction('restart')}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          </div>
        </div>
      )}

      {/* Capsule Progress Bar matching Image 2 */}
      <div className="overflow-x-auto pb-1">
        <div className="canvas-progress">
          <span className="done">
            <Check className="w-3.5 h-3.5 text-[#00B4D8]" />
            <span>Setup</span>
          </span>
          <span className="done">
            <Check className="w-3.5 h-3.5 text-[#00B4D8]" />
            <span>Capture</span>
          </span>
          <span className="done">
            <Check className="w-3.5 h-3.5 text-[#00B4D8]" />
            <span>Design</span>
          </span>
          <span className="now">
            <span>Storyboard</span>
          </span>
          <span className={status === 'building' || status === 'done' ? 'done' : ''}>
            {status === 'building' || status === 'done' ? <Check className="w-3.5 h-3.5 text-[#00B4D8]" /> : null}
            <span>Build</span>
          </span>
          <span className={status === 'done' ? 'done' : ''}>
            {status === 'done' ? <Check className="w-3.5 h-3.5 text-[#00B4D8]" /> : null}
            <span>Render</span>
          </span>
        </div>
      </div>

      {/* Summary Card with Distinct Vertical Dividers matching c-canvas.html */}
      <section className="canvas-summary">
        {/* Column 1: The One Message */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            The one message
          </div>
          <p className="font-display font-bold text-xl text-slate-900 tracking-tight leading-snug">
            {theOneMessage}
          </p>
        </div>

        {/* Column 2: Video Facts */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Video
          </div>
          <div className="space-y-1 text-sm font-semibold text-slate-900 tabular-nums">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>{totalDurationSec}s</span> <span className="text-slate-500 font-normal">long</span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {briefConfig?.aspect === '9:16' || briefConfig?.aspect === '1080x1920'
                  ? '9:16'
                  : briefConfig?.aspect === '1:1' || briefConfig?.aspect === '1080x1080'
                  ? '1:1'
                  : '16:9'}
              </span>
            </div>
            <div className="capitalize flex items-center gap-1.5 flex-wrap">
              <span>{briefConfig?.voice || 'Female'}</span> <span className="text-slate-400">·</span> <span>{briefConfig?.language || 'English'}</span>
              <span className="text-slate-300">·</span>
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                  briefConfig?.captions !== false
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {briefConfig?.captions !== false ? 'CC ON' : 'CC OFF'}
              </span>
            </div>
            <div className="capitalize flex items-center gap-1.5">
              <span>{briefConfig?.stylePreset || 'Auto'} <span className="text-slate-500 font-normal">style</span></span>
            </div>
          </div>
        </div>

        {/* Column 3: Brand Palette */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <span>Brand palette</span>
            {briefConfig?.brandColor && (
              <span className="text-sky-600 font-mono text-[10px] font-bold uppercase bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                {briefConfig.brandColor}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {briefConfig?.brandColor && !paletteSwatches.includes(briefConfig.brandColor) && (
              <i
                className="w-9 h-9 rounded-xl inline-block shadow-inner border-2 border-slate-900 ring-2 ring-slate-900/20"
                style={{ backgroundColor: briefConfig.brandColor }}
                title={`Primary Brand Accent: ${briefConfig.brandColor}`}
              />
            )}
            {paletteSwatches.map((hex, i) => (
              <i
                key={i}
                className="w-9 h-9 rounded-xl inline-block shadow-inner border border-slate-200/80"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Grid Header & View Toggle matching Image 2 */}
      <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
        <h2 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
          Scenes
        </h2>

        <div className="flex items-center gap-3">
          <div className="canvas-view-toggle">
            <button
              type="button"
              onClick={() => setCurrentMode('templates')}
              className={currentMode === 'templates' ? 'active' : ''}
            >
              Template Style
            </button>
            <button
              type="button"
              onClick={() => setCurrentMode('scenes')}
              className={currentMode === 'scenes' ? 'active' : ''}
            >
              {brandName} Scenes
            </button>
            <button
              type="button"
              onClick={() => setCurrentMode('editor')}
              className={`inline-flex items-center gap-1.5 ${currentMode === 'editor' ? 'active' : ''}`}
            >
              <Sparkles className="w-3 h-3 text-[#00C2FF]" />
              <span>Visual Editor</span>
            </button>
          </div>

          <span className="text-xs font-semibold text-slate-500 tabular-nums">
            {cardItems.length} scenes · {totalDurationSec}s
          </span>
        </div>
      </div>

      {/* Visual Editor View (Phase F9) or 3-Column Card Grid */}
      {currentMode === 'editor' ? (
        <SimpleVisualEditor
          jobId={jobId}
          slug={slug}
          brandName={brandName}
          initialScenes={cardItems}
          aspect={editAspect}
          brandColor={editBrandColor}
          status={status}
          balance={balance}
          onOpenStudio={handleOpenStudio}
          isStudioLoading={isStudioLoading}
          studioInfo={studioInfo}
          onRender={() => handleAction('render')}
          isSubmitting={isSubmitting}
          onCloseEditor={() => setCurrentMode('scenes')}
          onDescribeChange={(instruction) => handleAction('edit', { instruction })}
        />
      ) : (
        <div className="canvas-grid">
        {cardItems.map((item) => {
          const isTemplate = currentMode === 'templates';
          const displayTitle = isTemplate ? item.templateTitle : item.sceneTitle;
          const hasComment = Boolean(comments[item.id]);
          const isOpen = openCardId === item.id;

          return (
            <article
              key={item.id}
              onClick={() => {
                if (!isOpen) {
                  setOpenCardId(item.id);
                  if (!draftComments[item.id] && comments[item.id]) {
                    setDraftComments((prev) => ({ ...prev, [item.id]: comments[item.id] }));
                  }
                }
              }}
              className={`canvas-card ${isOpen ? 'open' : ''}`}
              style={{ background: item.bgFallback }}
            >
              {/* Card Image */}
              <img
                src={item.image}
                alt={displayTitle}
                className="canvas-card-img"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />

              {/* Multi-stop Gradient Vignette */}
              <div className="canvas-card-gradient" />

              {/* Top Left Title & Clean Badge */}
              <div className="canvas-card-title">
                <div className="text-xl sm:text-2xl font-extrabold leading-tight tracking-tight text-white line-clamp-1 drop-shadow-md">
                  {displayTitle}
                </div>
                {!isTemplate && (
                  <div className="canvas-card-sub text-xs sm:text-[13px] font-semibold text-white/90 mt-1 flex items-center gap-1.5 drop-shadow-sm">
                    <span>{item.role}</span>
                    <span className="text-white/40">·</span>
                    <span className="font-mono text-cyan-300 font-bold">{item.dur}s</span>
                  </div>
                )}
              </div>

              {/* Top Right Comment Badge */}
              {hasComment && (
                <span className="canvas-card-comment-badge">
                  <Check className="w-3 h-3" />
                  <span>Commented</span>
                </span>
              )}

              {/* Bottom Left Frosted Glass Button */}
              {!isOpen && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenCardId(item.id);
                    if (!draftComments[item.id] && comments[item.id]) {
                      setDraftComments((prev) => ({ ...prev, [item.id]: comments[item.id] }));
                    }
                  }}
                  className="canvas-card-btn"
                >
                  <span className="text-xs font-semibold">
                    {isTemplate ? 'View Style' : hasComment ? 'Edit Comment' : 'Edit Scene'}
                  </span>
                  <span className="text-sm font-extrabold">›</span>
                </button>
              )}

              {/* Expanding Soft Light Agency Card Drawer */}
              {isOpen && (
                <div
                  className="canvas-card-drawer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-extrabold text-base text-slate-900">
                        {item.role}
                      </h4>
                      {/* Duration Chip with +/- controls */}
                      <div className="inline-flex items-center gap-1 bg-[#EEF2FF] border border-blue-100 rounded-full px-2 py-0.5">
                        <button
                          type="button"
                          onClick={() => handleDurationDelta(item.id, item.dur, -1)}
                          className="w-4 h-4 rounded-full flex items-center justify-center text-blue-700 hover:bg-blue-100 transition-colors"
                          title="Reduce 1s"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs font-bold text-[#2B59FF] tabular-nums font-mono px-0.5">
                          {item.dur}s
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDurationDelta(item.id, item.dur, 1)}
                          className="w-4 h-4 rounded-full flex items-center justify-center text-blue-700 hover:bg-blue-100 transition-colors"
                          title="Add 1s"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenCardId(null)}
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Scene Visual Direction (from STORYBOARD.md) */}
                  {item.sceneDescription && (
                    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3 shrink-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Scene Visuals & Direction
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 leading-relaxed pl-2.5 border-l-2 border-slate-300">
                        {item.sceneDescription}
                      </p>
                    </div>
                  )}

                  {/* Voiceover Script */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3 shrink-0">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2B59FF]/70" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Voiceover Script
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-800 leading-relaxed italic pl-2.5 border-l-2 border-slate-200">
                      &ldquo;{item.vo}&rdquo;
                    </p>
                  </div>

                  {/* Comment Textarea */}
                  <div className="flex flex-col gap-1.5 flex-1 min-h-[90px]">
                    <label className="text-xs font-bold text-slate-700">
                      What should change in this scene?
                    </label>
                    <textarea
                      rows={3}
                      value={draftComments[item.id] ?? comments[item.id] ?? ''}
                      onChange={(e) =>
                        setDraftComments({ ...draftComments, [item.id]: e.target.value })
                      }
                      placeholder="e.g. Make the opening faster, add bolder headline..."
                      className="w-full flex-1 p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2B59FF]/20 focus:border-[#2B59FF] resize-y"
                    />
                  </div>

                  {/* Drawer Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 shrink-0">
                    <button
                      type="button"
                      onClick={() => setOpenCardId(null)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const val = (draftComments[item.id] ?? comments[item.id] ?? '').trim();
                        setComments((prev) => {
                          const updated = { ...prev };
                          if (val) updated[item.id] = val;
                          else delete updated[item.id];
                          return updated;
                        });
                        setOpenCardId(null);
                      }}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2B59FF] to-[#1A46E8] shadow-sm hover:from-[#1A46E8] hover:to-[#0F35C8] transition-all cursor-pointer"
                    >
                      Save comment
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
      )}

      {/* RENDER / REVIEW / READY SECTION (Phase F6 Complete Implementation) */}
      {['awaiting_render', 'queued_rendering', 'rendering', 'done'].includes(status) && (
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm my-6 transition-all">
          {/* 1. REVIEW / AWAITING RENDER STATE */}
          {status === 'awaiting_render' && (
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Timeline Composed &amp; Checks Passed</span>
              </div>

              <div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                  Ready to Render Your Launch Video
                </h2>
                <p className="text-slate-500 mt-2 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed">
                  All {cardItems.length} scenes, synchronized voiceover tracks, and animated typography transitions have been verified. Click below to compile your production 1080p MP4.
                </p>
              </div>

              {/* Contact sheet snapshot preview if generated */}
              {hasContactSheet && (
                <div className="w-full max-w-2xl rounded-2xl overflow-hidden border border-slate-200 bg-slate-950/90 shadow-md group relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/jobs/${jobId}/files/snapshots/contact-sheet.jpg`}
                    alt="Timeline Contact Sheet Preview"
                    className="w-full max-h-72 object-contain mx-auto"
                  />
                  <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-[11px] font-mono text-slate-300">
                    Contact Sheet Preview
                  </div>
                </div>
              )}

              {/* F8: Zero Credit Guard & Upgrade Banner */}
              {balance < 1 && (
                <div className="w-full max-w-2xl p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/80 border border-amber-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-2xs animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-xs sm:text-sm text-amber-950">
                        No Video Credits Remaining (0 left)
                      </h4>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                        Your free render quota is exhausted. Upgrade your plan to unlock 1080p MP4 rendering and cloud exports.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMockUpgradeModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-display font-bold text-xs transition-all shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>Upgrade to Render</span>
                  </button>
                </div>
              )}

              {/* Render CTA Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (balance < 1) {
                      setIsMockUpgradeModalOpen(true);
                      return;
                    }
                    handleAction('render');
                  }}
                  disabled={isSubmitting || balance < 1}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-display font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2.5 ${
                    balance < 1
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/60 shadow-none'
                      : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-lg cursor-pointer disabled:opacity-50'
                  }`}
                  title={balance < 1 ? 'Zero credits remaining — upgrade to render' : undefined}
                >
                  {balance < 1 ? (
                    <Lock className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Play className="w-4 h-4 fill-white text-white" />
                  )}
                  <span>
                    {isSubmitting
                      ? 'Queueing Render…'
                      : balance < 1
                      ? '0 Credits (Upgrade to Render)'
                      : 'Render Video (1080p MP4)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenStudio}
                  disabled={isStudioLoading}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  title="Open timeline in HyperFrames Studio"
                >
                  {isStudioLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  ) : (
                    <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>{isStudioLoading ? 'Opening Studio…' : 'Open in Studio'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  <span>Adjust Settings</span>
                </button>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                <span>Output: {editAspect}</span>
                <span>•</span>
                <span>Quality: 1080p High</span>
                <span>•</span>
                <span>Est. Time: ~30s</span>
              </div>

              {/* F7: Describe a change box in Review */}
              <div className="w-full max-w-2xl text-left bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 sm:p-5 mt-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2B59FF]" />
                    <span className="font-display font-extrabold text-sm text-slate-900">
                      Describe a Change to the Video
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    AI updates composition &amp; checks before render
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-300/80 p-1.5 focus-within:border-[#2B59FF] focus-within:ring-2 focus-within:ring-[#2B59FF]/10 transition-all">
                  <input
                    type="text"
                    value={editChangeText}
                    onChange={(e) => setEditChangeText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && editChangeText.trim()) {
                        handleAction('edit', { instruction: editChangeText.trim() });
                      }
                    }}
                    placeholder="e.g. “Make headline punchier, speed up scene 1, use bolder colors”"
                    className="flex-1 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent border-none outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editChangeText.trim()) {
                        handleAction('edit', { instruction: editChangeText.trim() });
                      }
                    }}
                    disabled={!editChangeText.trim() || isSubmitting}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Apply Edit</span>
                  </button>
                </div>
                {/* Quick edit inspiration pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-400">Suggestions:</span>
                  {[
                    'Make the first headline punchier',
                    'Speed up the intro transition',
                    'Use high-contrast dark accents',
                    'Shorten voiceover pacing'
                  ].map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditChangeText(sug)}
                      className="px-2.5 py-0.5 rounded-md bg-white hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-[11px] font-medium text-slate-600 hover:text-blue-700 transition-all cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. RENDERING PROGRESS STATE */}
          {(status === 'queued_rendering' || status === 'rendering') && (
            <div className="flex flex-col items-center text-center py-8 space-y-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-cyan-200/80 flex items-center justify-center shadow-md">
                  <Loader2 className="w-8 h-8 text-[#0096C7] animate-spin" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00B4D8]" />
                </span>
              </div>

              <div>
                <h2 className="font-display font-extrabold text-2xl text-slate-900">
                  Rendering 1080p Launch Video…
                </h2>
                <p className="text-slate-500 mt-1.5 max-w-md mx-auto text-xs leading-relaxed">
                  Compiling composition frames, rasterizing motion graphic assets, and encoding video stream with FFmpeg.
                </p>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full max-w-md bg-slate-100 h-2.5 rounded-full overflow-hidden relative shadow-inner">
                <div className="h-full bg-gradient-to-r from-[#00C2FF] via-[#0077B6] to-[#0096C7] rounded-full animate-pulse w-3/4 transition-all duration-700" />
              </div>

              <span className="font-mono text-xs text-slate-400">
                Processing render on local worker · ~25–40s
              </span>
            </div>
          )}

          {/* 3. DONE / VIDEO PLAYER STATE */}
          {status === 'done' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-extrabold text-xl text-slate-900">
                      Video Rendered Successfully
                    </h2>
                    <p className="text-xs text-slate-500">
                      1080p MP4 ready for preview, sharing, and download.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={`/api/jobs/${jobId}/files/renders/video.mp4?download=true`}
                    download
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download MP4</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      const url = `${window.location.origin}/api/jobs/${jobId}/files/renders/video.mp4`;
                      navigator.clipboard.writeText(url);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`/api/jobs/${jobId}/files/renders/video.mp4`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    <span>Open in Tab</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-cyan-200 bg-cyan-50/50 hover:bg-cyan-50 text-cyan-900 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                  >
                    <Share2 className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Share &amp; Embed</span>
                  </button>

                  <Link
                    href={`/new?from=${jobId}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100/80 text-amber-900 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                    title="Create another video using this style and voice"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Use as Recipe</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleOpenStudio}
                    disabled={isStudioLoading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                    title="Open timeline in HyperFrames Studio"
                  >
                    {isStudioLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    ) : (
                      <Sliders className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>{isStudioLoading ? 'Opening…' : 'Open in Studio'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (balance < 1) {
                        setIsMockUpgradeModalOpen(true);
                        return;
                      }
                      handleAction('render');
                    }}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {balance < 1 ? (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>{balance < 1 ? '0 Credits' : 'Re-render'}</span>
                  </button>
                </div>
              </div>

              {/* Video Player Display */}
              <div className="flex justify-center py-2">
                <div
                  className={`w-full overflow-hidden rounded-2xl bg-black border border-slate-800 shadow-2xl relative ${
                    editAspect === '9:16'
                      ? 'max-w-xs aspect-[9/16]'
                      : editAspect === '1:1'
                      ? 'max-w-md aspect-square'
                      : 'max-w-3xl aspect-video'
                  }`}
                >
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain"
                    src={`/api/jobs/${jobId}/files/renders/video.mp4`}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>

              {/* Video Metrics & Economics (PLAN.md § 6.3) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 text-left">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Duration</div>
                  <div className="font-display font-extrabold text-base text-slate-900 mt-0.5">
                    {totalDurationSec} seconds
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 text-left">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aspect &amp; Quality</div>
                  <div className="font-display font-extrabold text-base text-slate-900 mt-0.5">
                    {editAspect} · 1080p
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 text-left">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">File Size</div>
                  <div className="font-display font-extrabold text-base text-slate-900 mt-0.5">
                    {formatBytes(videoSizeBytes || renderRecord?.size_bytes)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 text-left">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <span>AI Cost</span>
                    <Zap className="w-3 h-3 text-amber-500" />
                  </div>
                  <div className="font-display font-extrabold text-base text-slate-900 mt-0.5 font-mono">
                    ${totalCostUsd.toFixed(3)}
                  </div>
                </div>
              </div>

              {/* F7: Describe a change & re-render in Done state */}
              <div className="w-full text-left bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 sm:p-5 mt-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2B59FF]" />
                    <span className="font-display font-extrabold text-sm text-slate-900">
                      Want to Change Something in this Video?
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    AI updates code &amp; prepares fresh review
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-300/80 p-1.5 focus-within:border-[#2B59FF] focus-within:ring-2 focus-within:ring-[#2B59FF]/10 transition-all">
                  <input
                    type="text"
                    value={editChangeText}
                    onChange={(e) => setEditChangeText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && editChangeText.trim()) {
                        handleAction('edit', { instruction: editChangeText.trim() });
                      }
                    }}
                    placeholder="e.g. “Make call-to-action button punchier, shorten scene 2, swap colors”"
                    className="flex-1 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent border-none outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editChangeText.trim()) {
                        handleAction('edit', { instruction: editChangeText.trim() });
                      }
                    }}
                    disabled={!editChangeText.trim() || isSubmitting}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Apply Edit</span>
                  </button>
                </div>
                {/* Quick edit inspiration pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-400">Suggestions:</span>
                  {[
                    'Make the CTA button bigger and brighter',
                    'Speed up pacing by 15%',
                    'Change accent gradient to purple',
                    'Tone down animations in scene 3'
                  ].map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditChangeText(sug)}
                      className="px-2.5 py-0.5 rounded-md bg-white hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-[11px] font-medium text-slate-600 hover:text-blue-700 transition-all cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Diagnostics: Collapsible Live Agent Stream Drawer */}
      <div className="rounded-3xl border border-slate-200/90 bg-slate-900 text-slate-200 overflow-hidden shadow-xs mt-8">
        <button
          type="button"
          onClick={() => setIsLogOpen(!isLogOpen)}
          className="w-full flex items-center justify-between px-6 py-3.5 bg-slate-950/80 border-b border-slate-800 text-left hover:bg-slate-950 transition-colors cursor-pointer"
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
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>{logs.length} events</span>
            {isLogOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isLogOpen && (
          <div className="p-4 max-h-60 overflow-y-auto font-mono text-xs space-y-1.5 bg-slate-900/95 scrollbar-thin">
            {logs.length === 0 ? (
              <p className="text-slate-500 italic py-2">
                Worker is ready or waiting for the next job command…
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

      {/* Diagnostics: Collapsible BRIEF.md Inspector */}
      <div className="rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setIsBriefOpen(!isBriefOpen)}
          className="w-full flex items-center justify-between px-6 py-3.5 bg-slate-50/70 text-left hover:bg-slate-100/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#00B4D8]" />
            <h3 className="font-display font-bold text-xs text-slate-800">
              Workspace Brief Contract (BRIEF.md)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono text-[11px]">videos/{slug}/BRIEF.md</span>
            {isBriefOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isBriefOpen && (
          <pre className="font-mono text-xs text-slate-700 bg-white p-5 border-t border-slate-100 whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-56">
            {briefMarkdown || 'Loading brief...'}
          </pre>
        )}
      </div>

      {/* Direction C Fixed Floating Composer matching Image 2 */}
      <div className="canvas-composer">
        <Sparkles className="w-4 h-4 text-[#2B59FF] shrink-0" />
        <input
          type="text"
          value={globalFeedback}
          onChange={(e) => setGlobalFeedback(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && globalFeedback.trim()) {
              if (['awaiting_render', 'done'].includes(status)) {
                handleAction('edit', { instruction: globalFeedback.trim() });
                setGlobalFeedback('');
              } else {
                handleAction('revise');
              }
            }
          }}
          placeholder={
            ['awaiting_render', 'done'].includes(status)
              ? 'Describe a change to the video — e.g. “make headline punchier”'
              : 'Describe a change to the whole plan — e.g. “make it more playful”'
          }
          className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 font-sans min-w-0"
        />
        <button
          type="button"
          onClick={() => {
            if (globalFeedback.trim()) {
              if (['awaiting_render', 'done'].includes(status)) {
                handleAction('edit', { instruction: globalFeedback.trim() });
                setGlobalFeedback('');
              } else {
                handleAction('revise');
              }
            }
          }}
          disabled={!globalFeedback.trim() || isSubmitting}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2B59FF] to-[#1A46E8] hover:from-[#1A46E8] hover:to-[#0F35C8] transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? 'Sending…' : 'Send'}
        </button>
      </div>

      {/* HeyGen-Style Edit Brief Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overscroll-contain animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsEditModalOpen(false);
            }
          }}
        >
          <div
            className="bg-white rounded-[32px] max-w-2xl w-full shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 overscroll-contain"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (!target.closest('.relative')) {
                setIsBrandSystemOpen(false);
                setIsAspectMenuOpen(false);
                setIsLengthMenuOpen(false);
                setIsStyleMenuOpen(false);
              }
            }}
          >
            
            {/* 1. Thematic Hero Image Banner with Gradient Fade (Matching HeyGen) */}
            <div className="relative h-36 sm:h-44 shrink-0 overflow-hidden bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
                alt="Launch Video Banner"
                className="w-full h-full object-cover object-center opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-black/30" />

              {/* Close Button Top Right */}
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/85 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs shadow-xs"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Banner Title & Subtitle */}
              <div className="absolute bottom-3.5 left-7 right-7">
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight leading-tight">
                  Launch Video Brief
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5 line-clamp-1">
                  Make any product easier to launch with a short, step-by-step video story.
                </p>
              </div>
            </div>

            {/* 2. Scrollable Modal Content */}
            <div
              className="p-7 pb-48 overflow-y-auto overscroll-contain space-y-6 scrollbar-thin"
              onScroll={closeAllMenus}
            >
              
              {/* Section 1: Video Details (Textarea + Inside Script Writer Pill) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[15px] font-bold text-slate-900">
                    Video Details
                  </label>
                  <div className="flex items-center gap-2.5">
                    {editKeyMessage.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={() => setEditKeyMessage('')}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-slate-200/70 hover:border-rose-200 shadow-2xs"
                        title="Clear all text (Tozalash)"
                      >
                        <span className="text-[10px]">✕</span>
                        <span>Clear</span>
                      </button>
                    )}
                    <span
                      className={`text-xs font-mono tabular-nums ${
                        editKeyMessage.length > 450 ? 'text-amber-600 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {editKeyMessage.length} / 500
                    </span>
                  </div>
                </div>

                <div className="relative rounded-2xl border-2 border-sky-300 focus-within:border-[#00B4D8] focus-within:ring-4 focus-within:ring-[#00B4D8]/10 bg-white transition-all shadow-xs overflow-hidden">
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={editKeyMessage}
                    onChange={(e) => setEditKeyMessage(e.target.value)}
                    placeholder="Type your script or a prompt for me to generate one for you"
                    className="w-full p-4 pr-11 pb-14 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none bg-transparent leading-relaxed"
                  />

                  {/* Top-Right: Quick Clear ✕ Button inside textarea box */}
                  {editKeyMessage.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => setEditKeyMessage('')}
                      className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
                      title="Clear text (Tozalash)"
                    >
                      <span className="text-xs font-bold leading-none">✕</span>
                    </button>
                  )}

                  {/* Inside-bottom: Script Writer pill button matching HeyGen */}
                  <div className="absolute bottom-3 left-3.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const polished = editKeyMessage.trim()
                          ? `Create a snappy, high-converting launch video for ${brandName}. Focus on: ${editKeyMessage.trim()}. Keep pacing brisk, highlight key value props, and end with a crisp call to action.`
                          : `Create a fast-paced, cinematic launch video for ${brandName}. Highlight modern developer experience, fast workflows, and frictionless collaboration.`;
                        setEditKeyMessage(polished.slice(0, 500));
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-800 text-xs font-bold border border-slate-200/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#00B4D8]" />
                      <span>Script Writer</span>
                    </button>
                  </div>
                </div>

                {/* Prompt Inspiration Ideas */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="text-xs font-semibold text-slate-400 shrink-0 mr-0.5">Ideas:</span>
                  {PROMPT_IDEAS.map((idea) => {
                    const isActive = editKeyMessage.includes(idea.prompt) || editKeyMessage.includes(idea.label);
                    return (
                      <button
                        key={idea.id}
                        type="button"
                        onClick={() => {
                          setEditKeyMessage((prev: string) => {
                            const trimmed = prev.trim();
                            if (!trimmed) return idea.prompt;
                            if (trimmed.includes(idea.prompt)) {
                              // Toggle off
                              const stripped = trimmed
                                .replace(idea.prompt, '')
                                .replace(/\.\s*\./g, '.')
                                .replace(/^\s*\.\s*/, '')
                                .trim();
                              return stripped;
                            }
                            if (trimmed.includes(idea.label)) {
                              // Toggle off by label
                              const stripped = trimmed
                                .replace(idea.label, '')
                                .replace(/\.\s*\./g, '.')
                                .replace(/^\s*\.\s*/, '')
                                .trim();
                              return stripped;
                            }
                            const separator = trimmed.endsWith('.') ? ' ' : '. ';
                            return `${trimmed}${separator}${idea.prompt}`.slice(0, 500);
                          });
                        }}
                        className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer flex items-center gap-1.5 border active:scale-95 ${
                          isActive
                            ? 'bg-cyan-50/80 border-[#00B4D8]/80 text-[#007799] font-bold shadow-2xs ring-1 ring-[#00B4D8]/30'
                            : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] border-slate-200/80 text-slate-700 font-medium'
                        }`}
                        title={idea.prompt}
                      >
                        <span className={`text-[13px] leading-none ${isActive ? 'text-[#00B4D8] font-black' : 'text-slate-400'}`}>
                          {isActive ? '✓' : '+'}
                        </span>
                        <span>{idea.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Website URL (Optional) */}
              <div className="space-y-2">
                <label className="text-[15px] font-bold text-slate-900 block">
                  Target Website URL <span className="text-slate-400 font-normal text-xs lowercase">(optional)</span>
                </label>
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus-within:border-[#00B4D8] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#00B4D8]/20 transition-all">
                  <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    placeholder="https://yourproduct.com (or leave empty for prompt-only video)"
                    className="w-full text-sm text-slate-900 placeholder:text-slate-400 bg-transparent border-none outline-none font-mono"
                  />
                  {editUrl && (
                    <button
                      type="button"
                      onClick={() => setEditUrl('')}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
                      title="Clear URL"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Section 2: Options (HeyGen Horizontal Pill Chips & Minimalist Dropdowns) */}
              <div className="space-y-3 pt-1">
                <label className="text-[15px] font-bold text-slate-900 block">
                  Options
                </label>
                
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* 1. Duration Pill Chip */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        const next = !isLengthMenuOpen;
                        closeAllMenus();
                        setIsLengthMenuOpen(next);
                      }}
                      className={`h-10 px-4 rounded-full border text-sm font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer ${
                        isLengthMenuOpen
                          ? 'bg-slate-100 border-slate-300 text-slate-900'
                          : 'bg-white border-slate-200/90 hover:bg-slate-50 text-slate-800'
                      }`}
                      title="Select video duration"
                    >
                      <HeygenClockIcon className="w-4 h-4 text-slate-700" />
                      <span>{editLength === '45s' ? 'Auto' : editLength === '15s' ? '15sec' : editLength === '30s' ? '30sec' : '1min'}</span>
                      <HeygenChevronIcon className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isLengthMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isLengthMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={closeAllMenus} />
                        <div className="absolute top-full mt-1.5 left-0 z-50 bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] border border-slate-100 p-1.5 min-w-[130px] animate-in fade-in zoom-in-95 duration-150">
                          {[
                            { len: '45s' as const, label: 'Auto' },
                            { len: '15s' as const, label: '15sec' },
                            { len: '30s' as const, label: '30sec' },
                            { len: '60s' as const, label: '1min' },
                          ].map((item) => (
                            <button
                              key={item.len}
                              type="button"
                              onClick={() => {
                                setEditLength(item.len);
                                setIsLengthMenuOpen(false);
                              }}
                              className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-slate-100/70 transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-2.5">
                                <HeygenClockIcon className="w-4 h-4 text-slate-700 shrink-0" />
                                <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                              </div>
                              {editLength === item.len && <HeygenCheckCircle className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* 2. Aspect Ratio Chip */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        const next = !isAspectMenuOpen;
                        closeAllMenus();
                        setIsAspectMenuOpen(next);
                      }}
                      className={`h-10 px-4 rounded-full border text-sm font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer ${
                        isAspectMenuOpen
                          ? 'bg-slate-100 border-slate-300 text-slate-900'
                          : 'bg-white border-slate-200/90 hover:bg-slate-50 text-slate-800'
                      }`}
                      title="Choose Aspect Ratio"
                    >
                      <HeygenAspectIcon className="w-4 h-4 text-slate-700" />
                      <span>{editAspect}</span>
                      <HeygenChevronIcon className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isAspectMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isAspectMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={closeAllMenus} />
                        <div className="absolute top-full mt-1.5 left-0 z-50 bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] border border-slate-100 p-1.5 min-w-[125px] animate-in fade-in zoom-in-95 duration-150">
                          {[
                            { ratio: '16:9' as const, label: '16:9' },
                            { ratio: '9:16' as const, label: '9:16' },
                            { ratio: '1:1' as const, label: '1:1' },
                          ].map((item) => (
                            <button
                              key={item.ratio}
                              type="button"
                              onClick={() => {
                                setEditAspect(item.ratio);
                                setIsAspectMenuOpen(false);
                              }}
                              className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-slate-100/70 transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-2.5">
                                <HeygenAspectIcon className="w-4 h-4 text-slate-700 shrink-0" />
                                <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                              </div>
                              {editAspect === item.ratio && <HeygenCheckCircle className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* 3. Style Preset Chip */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        const next = !isStyleMenuOpen;
                        closeAllMenus();
                        setIsStyleMenuOpen(next);
                      }}
                      className={`h-10 px-4 rounded-full border text-sm font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer ${
                        isStyleMenuOpen
                          ? 'bg-slate-100 border-slate-300 text-slate-900'
                          : 'bg-white border-slate-200/90 hover:bg-slate-50 text-slate-800'
                      }`}
                      title="Choose visual style preset"
                    >
                      <HeygenStyleIcon className="w-4 h-4 text-slate-700" />
                      <span>{editStylePreset === 'auto' ? 'Auto' : editStylePreset.charAt(0).toUpperCase() + editStylePreset.slice(1)}</span>
                      <HeygenChevronIcon className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isStyleMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isStyleMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={closeAllMenus} />
                        <div className="absolute top-full mt-1.5 left-0 z-50 bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] border border-slate-100 p-1.5 min-w-[130px] animate-in fade-in zoom-in-95 duration-150">
                          {[
                            { key: 'auto', label: 'Auto' },
                            { key: 'coral', label: 'Coral' },
                            { key: 'punchy', label: 'Punchy' },
                            { key: 'mono', label: 'Mono' },
                            { key: 'technical', label: 'Technical' },
                          ].map((item) => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => {
                                setEditStylePreset(item.key);
                                setIsStyleMenuOpen(false);
                              }}
                              className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-slate-100/70 transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-2.5">
                                <HeygenStyleIcon className="w-4 h-4 text-slate-700 shrink-0" />
                                <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                              </div>
                              {editStylePreset === item.key && <HeygenCheckCircle className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* 4. Captions Chip (Single-click toggle matching HeyGen) */}
                  <button
                    type="button"
                    onClick={() => {
                      closeAllMenus();
                      setEditCaptions(!editCaptions);
                    }}
                    className="h-10 px-4 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                    title={editCaptions ? 'Captions are ON. Click to disable.' : 'Captions are OFF. Click to enable.'}
                  >
                    <HeygenCaptionsIcon className="w-4 h-4 text-slate-700" />
                    <span>Captions</span>
                    <span className={`text-xs font-semibold ${editCaptions ? 'text-slate-500' : 'text-slate-400'}`}>
                      {editCaptions ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* 5. Brand System Chip (Functional Popover with Color Picker) */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        const next = !isBrandSystemOpen;
                        closeAllMenus();
                        setIsBrandSystemOpen(next);
                      }}
                      className={`h-10 px-4 rounded-full border text-sm font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer ${
                        isBrandSystemOpen
                          ? 'bg-slate-100 border-slate-300 text-slate-900'
                          : 'bg-white border-slate-200/90 hover:bg-slate-50 text-slate-800'
                      }`}
                      title="Configure Brand Color"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs shrink-0"
                        style={{ backgroundColor: editBrandColor || '#2B59FF' }}
                      />
                      <span>Brand System</span>
                      <HeygenChevronIcon className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isBrandSystemOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isBrandSystemOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={closeAllMenus} />
                        <div className="absolute top-full mt-1.5 left-0 z-50 bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] border border-slate-100 p-3 w-[190px] animate-in fade-in zoom-in-95 duration-150">
                          <div className="grid grid-cols-4 gap-2 mb-2.5">
                            {[
                              { hex: '#2B59FF', darkIcon: false },
                              { hex: '#00C2FF', darkIcon: true },
                              { hex: '#10B981', darkIcon: false },
                              { hex: '#8B5CF6', darkIcon: false },
                              { hex: '#FF5733', darkIcon: false },
                              { hex: '#F59E0B', darkIcon: true },
                              { hex: '#EC4899', darkIcon: false },
                              { hex: '#0F172A', darkIcon: false },
                            ].map((swatch) => {
                              const isSelected = editBrandColor.toLowerCase() === swatch.hex.toLowerCase();
                              return (
                                <button
                                  key={swatch.hex}
                                  type="button"
                                  onClick={() => {
                                    setEditBrandColor(swatch.hex);
                                    setIsBrandSystemOpen(false);
                                  }}
                                  className={`w-8 h-8 rounded-full transition-all cursor-pointer flex items-center justify-center shadow-2xs hover:scale-110 active:scale-95 ${
                                    isSelected ? 'ring-2 ring-offset-2 ring-[#00B4D8] scale-105' : 'border border-black/10'
                                  }`}
                                  style={{ backgroundColor: swatch.hex }}
                                  title={swatch.hex}
                                >
                                  {isSelected && (
                                    <Check className={`w-3.5 h-3.5 ${swatch.darkIcon ? 'text-slate-900' : 'text-white'} stroke-[3]`} />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                            <input
                              type="color"
                              value={editBrandColor.startsWith('#') ? editBrandColor : '#2B59FF'}
                              onChange={(e) => setEditBrandColor(e.target.value.toUpperCase())}
                              className="w-6 h-6 rounded-full cursor-pointer border border-black/10 p-0 overflow-hidden bg-transparent shrink-0"
                              title="Color Picker"
                            />
                            <div className="relative flex-1">
                              <span className="absolute left-2 top-1 text-[11px] font-mono text-slate-400 font-bold">#</span>
                              <input
                                type="text"
                                maxLength={7}
                                value={editBrandColor.replace(/^#/, '')}
                                onChange={(e) => setEditBrandColor(`#${e.target.value.replace(/[^0-9a-fA-F]/g, '')}`)}
                                className="w-full pl-4.5 pr-1.5 py-0.5 text-xs font-mono font-bold rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 uppercase bg-slate-50 text-slate-800"
                                placeholder="2B59FF"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* 6. Voice Narration Chip */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        const next = !isVoiceMenuOpen;
                        closeAllMenus();
                        setIsVoiceMenuOpen(next);
                      }}
                      className={`h-10 px-4 rounded-full border text-sm font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer ${
                        isVoiceMenuOpen
                          ? 'bg-slate-100 border-slate-300 text-slate-900'
                          : 'bg-white border-slate-200/90 hover:bg-slate-50 text-slate-800'
                      }`}
                      title="Choose Voice"
                    >
                      <HeygenVoiceIcon className="w-4 h-4 text-slate-700" />
                      <span>{editVoice === 'female' ? 'Female Voice' : 'Male Voice'}</span>
                      <HeygenChevronIcon className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isVoiceMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isVoiceMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={closeAllMenus} />
                        <div className="absolute top-full mt-1.5 left-0 z-50 bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] border border-slate-100 p-1.5 min-w-[145px] animate-in fade-in zoom-in-95 duration-150">
                          {[
                            { key: 'female' as const, label: 'Female Voice' },
                            { key: 'male' as const, label: 'Male Voice' },
                          ].map((item) => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => {
                                setEditVoice(item.key);
                                setIsVoiceMenuOpen(false);
                              }}
                              className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-slate-100/70 transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-2.5">
                                <HeygenVoiceIcon className="w-4 h-4 text-slate-700 shrink-0" />
                                <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                              </div>
                              {editVoice === item.key && <HeygenCheckCircle className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* 7. Intent / Mode Chip */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        const next = !isIntentMenuOpen;
                        closeAllMenus();
                        setIsIntentMenuOpen(next);
                      }}
                      className={`h-10 px-4 rounded-full border text-sm font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer ${
                        isIntentMenuOpen
                          ? 'bg-slate-100 border-slate-300 text-slate-900'
                          : 'bg-white border-slate-200/90 hover:bg-slate-50 text-slate-800'
                      }`}
                      title="Choose Video Goal"
                    >
                      <HeygenTargetIcon className="w-4 h-4 text-slate-700" />
                      <span>{editIntent === 'promote' ? 'Promote Product' : 'Show Site As-Is'}</span>
                      <HeygenChevronIcon className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isIntentMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isIntentMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={closeAllMenus} />
                        <div className="absolute top-full mt-1.5 left-0 sm:left-auto sm:right-0 z-50 bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] border border-slate-100 p-1.5 min-w-[165px] animate-in fade-in zoom-in-95 duration-150">
                          {[
                            { key: 'promote' as const, label: 'Promote Product' },
                            { key: 'show_site' as const, label: 'Show Site As-Is' },
                          ].map((item) => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => {
                                setEditIntent(item.key);
                                setIsIntentMenuOpen(false);
                              }}
                              className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-slate-100/70 transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-2.5">
                                <HeygenTargetIcon className="w-4 h-4 text-slate-700 shrink-0" />
                                <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                              </div>
                              {editIntent === item.key && <HeygenCheckCircle className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* 3. Footer matching HeyGen: Clean, prominent black pill Continue button */}
            <div className="p-5 px-7 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleAction('edit_brief')}
                disabled={isSubmitting}
                className="h-11 px-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{isSubmitting ? 'Saving & Starting…' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* F8: In-Place Mock Upgrade Modal (Apple Minimalist) */}
      {isMockUpgradeModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isUpgradingInModal) {
              setIsMockUpgradeModalOpen(false);
              setModalUpgradeError(null);
            }
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-900">
                    Upgrade to Render
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Active Balance: {balance} credits remaining
                  </p>
                </div>
              </div>
              {!isUpgradingInModal && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMockUpgradeModalOpen(false);
                    setModalUpgradeError(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {modalUpgradeSuccess ? (
                <div className="py-6 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <h4 className="font-display font-extrabold text-base text-slate-900">
                    Credits Added Successfully!
                  </h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    {modalUpgradeSuccess}
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMockUpgradeModalOpen(false);
                        setModalUpgradeSuccess(null);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      Ready to Render
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Choose a plan to instantly add credits and compile your production 1080p launch video.
                  </p>

                  {/* Plan Options */}
                  <div className="space-y-2.5">
                    <div
                      onClick={() => !isUpgradingInModal && handleModalUpgrade('pro')}
                      className="p-4 rounded-2xl border-2 border-[#00B4D8] bg-cyan-50/20 hover:bg-cyan-50/40 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-slate-900">
                            Pro Creator (Mock)
                          </span>
                          <span className="text-[10px] font-extrabold text-[#0096C7] uppercase bg-cyan-100/80 px-2 py-0.5 rounded-full">
                            +30 Credits
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          High quality 1080p, priority worker queue, Studio access
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-display font-extrabold text-sm text-slate-900">
                          $29<span className="text-[10px] font-normal text-slate-500">/mo</span>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 group-hover:underline">
                          Select &rsaquo;
                        </span>
                      </div>
                    </div>

                    <div
                      onClick={() => !isUpgradingInModal && handleModalUpgrade('team')}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-slate-900">
                            Team &amp; Agency (Mock)
                          </span>
                          <span className="text-[10px] font-extrabold text-slate-600 uppercase bg-slate-100 px-2 py-0.5 rounded-full">
                            +100 Credits
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          High-volume render pipeline, cloud rendering
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-display font-extrabold text-sm text-slate-900">
                          $89<span className="text-[10px] font-normal text-slate-500">/mo</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 group-hover:underline">
                          Select &rsaquo;
                        </span>
                      </div>
                    </div>
                  </div>

                  {modalUpgradeError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                      {modalUpgradeError}
                    </div>
                  )}

                  {isUpgradingInModal && (
                    <div className="py-2 flex items-center justify-center gap-2 text-xs text-blue-600 font-bold">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Simulating mock payment &amp; adding credits…</span>
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[10px] text-slate-400">Sandbox mode — no charge</span>
                    <Link
                      href="/billing"
                      target="_blank"
                      className="text-[11px] font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1"
                    >
                      <span>View Full Billing &amp; Plans</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* F10: Share & Embed Modal (Apple Minimalist) */}
      {isShareModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsShareModalOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-200/60">
                  <Share2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-900">
                    Share &amp; Embed Video
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    1080p MP4 · {slug || 'Product Video'} · HTTP Range Streaming Ready
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-6 pt-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setActiveShareTab('link')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeShareTab === 'link'
                    ? 'border-cyan-600 text-cyan-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Direct Link</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveShareTab('embed')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeShareTab === 'embed'
                    ? 'border-cyan-600 text-cyan-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>HTML &lt;video&gt;</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveShareTab('iframe')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeShareTab === 'iframe'
                    ? 'border-cyan-600 text-cyan-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Iframe Player</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveShareTab('script')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeShareTab === 'script'
                    ? 'border-cyan-600 text-cyan-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Script &amp; Copy</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Tab 1: Direct Link */}
              {activeShareTab === 'link' && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Direct MP4 Video Stream URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={typeof window !== 'undefined' ? `${window.location.origin}/api/jobs/${jobId}/files/renders/video.mp4` : ''}
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-700 select-all focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${window.location.origin}/api/jobs/${jobId}/files/renders/video.mp4`;
                          copyShareContent(url, 'link');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedShareItem === 'link' ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy URL</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-cyan-50/50 border border-cyan-100 flex items-start gap-2.5 text-xs text-cyan-950">
                    <Zap className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">HTTP Range Streaming Enabled:</span>
                      <p className="text-[11px] text-cyan-900/80 mt-0.5">
                        This URL supports byte-range requests (HTTP 206), enabling smooth scrub playback, dynamic buffering, and seamless compatibility with mobile browsers and apps.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <a
                      href={`/api/jobs/${jobId}/files/renders/video.mp4?download=true`}
                      download
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Download MP4 File</span>
                    </a>
                    <a
                      href={`/api/jobs/${jobId}/files/renders/video.mp4`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      <span>Open in Browser Tab</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Tab 2: HTML5 Video Tag */}
              {activeShareTab === 'embed' && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Responsive HTML5 Snippet
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const origin = typeof window !== 'undefined' ? window.location.origin : '';
                          const snippet = `<video\n  controls\n  playsinline\n  width="100%"\n  style="border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.12);"\n  poster="${origin}/api/jobs/${jobId}/files/snapshots/contact-sheet.jpg"\n>\n  <source src="${origin}/api/jobs/${jobId}/files/renders/video.mp4" type="video/mp4" />\n  Your browser does not support HTML5 video.\n</video>`;
                          copyShareContent(snippet, 'embed');
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700 cursor-pointer"
                      >
                        {copiedShareItem === 'embed' ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
{`<video
  controls
  playsinline
  width="100%"
  style="border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.12);"
  poster="${typeof window !== 'undefined' ? window.location.origin : ''}/api/jobs/${jobId}/files/snapshots/contact-sheet.jpg"
>
  <source src="${typeof window !== 'undefined' ? window.location.origin : ''}/api/jobs/${jobId}/files/renders/video.mp4" type="video/mp4" />
  Your browser does not support HTML5 video.
</video>`}
                    </pre>
                  </div>

                  <p className="text-xs text-slate-500">
                    Paste this snippet directly into Framer, Webflow, WordPress, Ghost, or your custom Next.js/HTML landing page.
                  </p>
                </div>
              )}

              {/* Tab 3: Iframe Player */}
              {activeShareTab === 'iframe' && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Embedded Player Iframe
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const origin = typeof window !== 'undefined' ? window.location.origin : '';
                          const snippet = `<iframe\n  src="${origin}/projects/${jobId}"\n  width="100%"\n  height="540"\n  frameborder="0"\n  allow="autoplay; fullscreen; picture-in-picture"\n  style="border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;"\n></iframe>`;
                          copyShareContent(snippet, 'iframe');
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700 cursor-pointer"
                      >
                        {copiedShareItem === 'iframe' ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
{`<iframe
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/projects/${jobId}"
  width="100%"
  height="540"
  frameborder="0"
  allow="autoplay; fullscreen; picture-in-picture"
  style="border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;"
></iframe>`}
                    </pre>
                  </div>

                  <p className="text-xs text-slate-500">
                    Embeds the full interactive player with scene timeline context and responsive video frame.
                  </p>
                </div>
              )}

              {/* Tab 4: Script & Copy */}
              {activeShareTab === 'script' && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Full Voiceover Transcript
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const fullScript = storyboard?.frames?.map(f => f.voiceover).filter(Boolean).join(' ') || theOneMessage;
                          copyShareContent(fullScript, 'full_script');
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700 cursor-pointer"
                      >
                        {copiedShareItem === 'full_script' ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Transcript</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-36 overflow-y-auto">
                      {storyboard?.frames?.map(f => f.voiceover).filter(Boolean).join(' ') || theOneMessage}
                    </div>
                  </div>

                  {storyboard?.frames && storyboard.frames.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Scene-by-Scene Timings
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const breakdown = storyboard.frames.map(f => `[${f.duration}] ${f.title}\n${f.voiceover}`).join('\n\n');
                            copyShareContent(breakdown, 'scene_breakdown');
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700 cursor-pointer"
                        >
                          {copiedShareItem === 'scene_breakdown' ? (
                            <>
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Breakdown</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {storyboard.frames.map((frame, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs">
                            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase mb-1">
                              <span>Scene {idx + 1} · {frame.title}</span>
                              <span className="font-mono text-slate-600">{frame.duration}</span>
                            </div>
                            <p className="text-slate-800 font-medium text-[11px] leading-snug">
                              "{frame.voiceover}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400">
                1080p · MP4 · Audio AAC Stereo
              </span>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}