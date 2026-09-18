import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getCurrentUser, getUserCreditBalance } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { plan = 'pro', customCredits } = body;

    let delta = 30;
    let reason = 'Plan Upgrade: Pro Creator (+30 Credits)';

    if (plan === 'team') {
      delta = 100;
      reason = 'Plan Upgrade: Team & Agency (+100 Credits)';
    } else if (typeof customCredits === 'number' && customCredits > 0) {
      delta = customCredits;
      reason = `Mock Credit Top-up (+${customCredits} Credits)`;
    }

    const db = getDb();
    const nowIso = new Date().toISOString();
    const ledgerId = crypto.randomUUID();

    db.prepare(`
      INSERT INTO credit_ledger (id, user_id, delta, reason, job_id, ts)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(ledgerId, user.id, delta, reason, null, nowIso);

    const newBalance = getUserCreditBalance(user.id);

    return NextResponse.json({
      success: true,
      plan: plan === 'team' ? 'team' : 'pro',
      creditsAdded: delta,
      balance: newBalance,
      message: `Successfully added ${delta} credits! Your active balance is now ${newBalance}.`,
    });
  } catch (error) {
    console.error('Billing upgrade error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the upgrade.' },
      { status: 500 }
    );
  }
}
