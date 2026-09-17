import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { Sparkles, Check, Zap, Shield, HelpCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const user = await getCurrentUser();

  const plans = [
    {
      name: 'Free Starter',
      tagline: 'Ideal for testing autonomous AI video pipelines',
      price: '$0',
      period: 'forever',
      current: true,
      features: [
        '5 full launch video credits included',
        'Headless Claude Code & HyperFrames pipeline',
        'Automatic storyboard generation',
        'Natural studio voices (HeyGen OAuth)',
        '1080p high quality MP4 export',
      ],
      ctaText: 'Current Plan',
      ctaDisabled: true,
    },
    {
      name: 'Pro Creator',
      tagline: 'For founders, marketers, and product teams',
      price: '$29',
      period: 'per month',
      popular: true,
      current: false,
      features: [
        '30 launch video credits per month',
        'Faster headless agent priority',
        'Custom voice styles & music library',
        'Instant revision and scene re-renders',
        'Direct Studio editor access',
        'Commercial usage rights',
      ],
      ctaText: 'Upgrade to Pro (Mock)',
      ctaDisabled: false,
    },
    {
      name: 'Team & Agency',
      tagline: 'Scale video generation for your clients',
      price: '$89',
      period: 'per month',
      current: false,
      features: [
        'Unlimited video generation',
        'Multiple concurrent worker jobs',
        'Custom branding & typography tokens',
        'Cloud render (AWS Lambda / Cloud Run)',
        'Dedicated API access & webhook sync',
      ],
      ctaText: 'Contact Sales (Mock)',
      ctaDisabled: false,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900">
          Billing & Plans
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Transparent usage and subscription plans for autonomous video creation
        </p>
      </div>

      {/* Credit Balance Card */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-700/50">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00C2FF] bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-800/60">
              Active Balance
            </span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight tabular-nums">
            {user?.balance ?? 5} Videos Remaining
          </h2>
          <p className="text-sm text-slate-300">
            Each video generation consumes 1 credit upon initial storyboard confirmation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
            <span className="block text-2xl font-bold font-display text-[#00C2FF] tabular-nums">
              100%
            </span>
            <span className="text-[11px] text-slate-300 uppercase tracking-wider">
              Free Quota
            </span>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all relative ${
              plan.popular
                ? 'bg-white border-2 border-[#00B4D8] shadow-lg shadow-cyan-100/50'
                : 'bg-white/80 border border-slate-200/80 shadow-xs'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00C2FF] to-[#2B59FF] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                Most Popular
              </div>
            )}

            <div>
              <div className="mb-4">
                <h3 className="font-display font-bold text-lg text-slate-900">
                  {plan.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500 min-h-[32px]">
                  {plan.tagline}
                </p>
              </div>

              <div className="mb-6 flex items-baseline gap-1.5">
                <span className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tabular-nums">
                  {plan.price}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  / {plan.period}
                </span>
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
              <button
                disabled={plan.ctaDisabled}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-150 ${
                  plan.current
                    ? 'bg-slate-100 text-slate-500 cursor-default'
                    : plan.popular
                    ? 'bg-[#0F172A] hover:bg-slate-800 text-white shadow-sm hover:shadow'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200'
                }`}
              >
                {plan.ctaText}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}