'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Check, 
  Zap, 
  Shield, 
  CreditCard, 
  ArrowRight, 
  Loader2, 
  X, 
  CheckCircle2, 
  TrendingUp, 
  Calendar,
  Layers,
  Lock,
  Plus
} from 'lucide-react';
import { CreditLedgerEntry } from '@/lib/db';

interface BillingClientProps {
  initialBalance: number;
  userEmail: string;
  initialTransactions: CreditLedgerEntry[];
  currentTier?: 'free' | 'pro' | 'team';
}

export default function BillingClient({
  initialBalance,
  userEmail,
  initialTransactions,
  currentTier = 'free',
}: BillingClientProps) {
  const router = useRouter();
  const [balance, setBalance] = useState<number>(initialBalance);
  const [transactions, setTransactions] = useState<CreditLedgerEntry[]>(initialTransactions);
  const [activeTier, setActiveTier] = useState<'free' | 'pro' | 'team'>(currentTier);

  // Modal State
  const [selectedPlan, setSelectedPlan] = useState<{
    id: 'pro' | 'team';
    name: string;
    price: string;
    credits: number;
  } | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'one-click' | 'test-card'>('one-click');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<{
    planName: string;
    creditsAdded: number;
    newBalance: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleUpgradeConfirm() {
    if (!selectedPlan) return;

    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const res = await fetch('/api/billing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan.id,
          method: paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process mock upgrade.');
      }

      setBalance(data.balance);
      setActiveTier(selectedPlan.id);
      setCheckoutSuccess({
        planName: selectedPlan.name,
        creditsAdded: data.creditsAdded,
        newBalance: data.balance,
      });

      // Fetch fresh transactions in background
      try {
        const histRes = await fetch('/api/billing/history');
        if (histRes.ok) {
          const histData = await histRes.json();
          if (histData.transactions) {
            setTransactions(histData.transactions);
          }
        }
      } catch (e) {
        console.error('Failed to refresh transactions:', e);
      }

      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during upgrade.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  }

  function closeModal() {
    setSelectedPlan(null);
    setCheckoutSuccess(null);
    setErrorMessage(null);
  }

  const plans = [
    {
      id: 'free' as const,
      name: 'Free Starter',
      tagline: 'Ideal for testing autonomous AI video pipelines',
      price: '$0',
      period: 'forever',
      creditsLabel: '5 video credits included',
      features: [
        '5 full launch video credits included',
        'Headless Claude Code & HyperFrames pipeline',
        'Automatic storyboard generation',
        'Natural studio voices (HeyGen OAuth)',
        '1080p high quality MP4 export',
      ],
    },
    {
      id: 'pro' as const,
      name: 'Pro Creator',
      tagline: 'For founders, marketers, and product teams',
      price: '$29',
      period: 'per month',
      creditsLabel: '30 video credits included',
      popular: true,
      features: [
        '30 launch video credits per month',
        'Priority headless agent worker queue',
        'Full HyperFrames Studio editor access',
        'Unlimited scene revisions & text edits',
        'Custom brand color & typography presets',
        'Commercial usage license',
      ],
    },
    {
      id: 'team' as const,
      name: 'Team & Agency',
      tagline: 'Scale video generation for your clients',
      price: '$89',
      period: 'per month',
      creditsLabel: '100 video credits included',
      features: [
        '100 launch video credits per month',
        'Multiple concurrent worker jobs',
        'Dedicated custom style tokens',
        'Cloud render (AWS Lambda / Cloud Run)',
        'API & Webhook synchronization',
        'Priority 24/7 dedicated support',
      ],
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900">
          Billing & Plans
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Transparent usage and mock subscription plans for autonomous video creation
        </p>
      </div>

      {/* Credit Balance Card */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-700/50 relative overflow-hidden">
        {/* Background glow circle */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#00C2FF]/10 blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00C2FF] bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800/60 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#00C2FF]" />
              <span>
                {activeTier === 'team'
                  ? 'Team Tier Active'
                  : activeTier === 'pro'
                  ? 'Pro Tier Active'
                  : 'Free Starter Tier'}
              </span>
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight tabular-nums">
              {balance} {balance === 1 ? 'Credit' : 'Credits'} Remaining
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
            Each video generation consumes 1 credit upon initial storyboard confirmation or 1080p render.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            type="button"
            onClick={() =>
              setSelectedPlan({
                id: 'pro',
                name: 'Pro Creator',
                price: '$29',
                credits: 30,
              })
            }
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#00C2FF] to-[#2B59FF] hover:from-[#00B4D8] hover:to-[#1A46E8] text-slate-950 font-display font-extrabold text-xs sm:text-sm transition-all shadow-md hover:shadow-cyan-500/20 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Credits / Upgrade</span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent =
            (plan.id === 'free' && activeTier === 'free') ||
            (plan.id === 'pro' && activeTier === 'pro') ||
            (plan.id === 'team' && activeTier === 'team');

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all relative ${
                plan.popular
                  ? 'bg-white border-2 border-[#00B4D8] shadow-lg shadow-cyan-100/50'
                  : 'bg-white/80 border border-slate-200/80 shadow-xs'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00C2FF] to-[#2B59FF] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                  Most Popular
                </div>
              )}

              <div>
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-lg text-slate-900">
                      {plan.name}
                    </h3>
                    {isCurrent && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 min-h-[32px]">
                    {plan.tagline}
                  </p>
                </div>

                <div className="mb-4 flex items-baseline gap-1.5">
                  <span className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tabular-nums">
                    {plan.price}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    / {plan.period}
                  </span>
                </div>

                <div className="mb-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 text-[11px] font-bold text-slate-700">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{plan.creditsLabel}</span>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-100 text-slate-400 cursor-default border border-slate-200/60"
                  >
                    Current Plan
                  </button>
                ) : plan.id === 'free' ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-100 text-slate-400 cursor-default border border-slate-200/60"
                  >
                    Included at Signup
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPlan({
                        id: plan.id,
                        name: plan.name,
                        price: plan.price,
                        credits: plan.id === 'pro' ? 30 : 100,
                      })
                    }
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98] ${
                      plan.popular
                        ? 'bg-[#0F172A] hover:bg-slate-800 text-white'
                        : 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-300'
                    }`}
                  >
                    Upgrade to {plan.name} (Mock)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Credit Activity History (PLAN.md § F8) */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00B4D8]" />
            <h3 className="font-display font-bold text-base text-slate-900">
              Credit Activity History
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {transactions.length} events recorded
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No credit transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date &amp; Time</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Credits Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {transactions.map((tx) => {
                  const isPositive = tx.delta > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(tx.ts).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {tx.reason}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] ${
                            isPositive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isPositive ? `+${tx.delta}` : `${tx.delta}`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Mock Checkout Modal */}
      {selectedPlan && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isProcessing) {
              closeModal();
            }
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-900">
                    Mock Checkout
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Simulate plan upgrade with 0 actual payment
                  </p>
                </div>
              </div>
              {!isProcessing && (
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {checkoutSuccess ? (
                /* Success View */
                <div className="py-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-lg text-slate-900">
                      Payment Simulation Successful!
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                      Your account has been upgraded to{' '}
                      <span className="font-bold text-slate-900">
                        {checkoutSuccess.planName}
                      </span>
                      .
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-center">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Updated Balance
                    </span>
                    <span className="font-display font-extrabold text-2xl text-emerald-900 mt-0.5 block tabular-nums">
                      {checkoutSuccess.newBalance} Video Credits
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      (+{checkoutSuccess.creditsAdded} credits credited instantly)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                  >
                    Done &amp; Continue
                  </button>
                </div>
              ) : (
                /* Checkout Form View */
                <>
                  {/* Order Summary */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Plan Selected:</span>
                      <span className="font-bold text-slate-900">{selectedPlan.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Credits Included:</span>
                      <span className="font-bold text-emerald-700">+{selectedPlan.credits} Credits</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/70">
                      <span className="font-bold text-slate-800">Total Price:</span>
                      <span className="font-display font-extrabold text-base text-slate-900">
                        {selectedPlan.price} <span className="text-[10px] font-normal text-slate-500">/mo (Mock)</span>
                      </span>
                    </div>
                  </div>

                  {/* Mock Payment Options */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Select Payment Method (Simulation)
                    </label>

                    <div
                      onClick={() => setPaymentMethod('one-click')}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        paymentMethod === 'one-click'
                          ? 'border-[#2B59FF] bg-blue-50/50 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                          1-TAP
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Instant Demo Checkout</div>
                          <div className="text-[11px] text-slate-500">Instant approval, zero card needed</div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'one-click' ? 'border-[#2B59FF] bg-[#2B59FF]' : 'border-slate-300'
                      }`}>
                        {paymentMethod === 'one-click' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                      </div>
                    </div>

                    <div
                      onClick={() => setPaymentMethod('test-card')}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        paymentMethod === 'test-card'
                          ? 'border-[#2B59FF] bg-blue-50/50 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-mono text-[9px] font-bold">
                          TEST
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Test Visa (•••• 4242)</div>
                          <div className="text-[11px] text-slate-500">Expires 12/28 · CVC 123</div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'test-card' ? 'border-[#2B59FF] bg-[#2B59FF]' : 'border-slate-300'
                      }`}>
                        {paymentMethod === 'test-card' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                      </div>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                      {errorMessage}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleUpgradeConfirm}
                      disabled={isProcessing}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] hover:from-slate-800 hover:to-slate-900 text-white font-display font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                          <span>Simulating Payment…</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 text-cyan-400" />
                          <span>Confirm &amp; Add +{selectedPlan.credits} Credits</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-2">
                      Mock billing sandbox mode — no actual charge will occur.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
