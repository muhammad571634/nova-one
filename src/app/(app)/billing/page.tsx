import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDb, CreditLedgerEntry } from '@/lib/db';
import BillingClient from '@/components/BillingClient';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const db = getDb();

  // Fetch user credit ledger transactions
  const rawTransactions = db.prepare(`
    SELECT id, user_id, delta, reason, job_id, ts
    FROM credit_ledger
    WHERE user_id = ?
    ORDER BY ts DESC
    LIMIT 30
  `).all(user.id) as unknown as CreditLedgerEntry[];

  const transactions = (rawTransactions || []).map((t) => ({ ...t }));

  // Infer user tier from credit ledger upgrades
  let currentTier: 'free' | 'pro' | 'team' = 'free';
  const hasTeam = transactions.some((t) => t.reason.toLowerCase().includes('team'));
  const hasPro = transactions.some((t) => t.reason.toLowerCase().includes('pro'));

  if (hasTeam) {
    currentTier = 'team';
  } else if (hasPro) {
    currentTier = 'pro';
  }

  return (
    <BillingClient
      initialBalance={user.balance}
      userEmail={user.email}
      initialTransactions={transactions}
      currentTier={currentTier}
    />
  );
}