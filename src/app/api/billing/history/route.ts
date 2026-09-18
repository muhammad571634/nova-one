import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb, CreditLedgerEntry } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const rows = db.prepare(`
      SELECT id, user_id, delta, reason, job_id, ts
      FROM credit_ledger
      WHERE user_id = ?
      ORDER BY ts DESC
      LIMIT 30
    `).all(user.id) as unknown as CreditLedgerEntry[];

    const transactions = (rows || []).map((r) => ({ ...r }));

    return NextResponse.json({
      success: true,
      balance: user.balance,
      transactions,
    });
  } catch (error) {
    console.error('Billing history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit transaction history.' },
      { status: 500 }
    );
  }
}
