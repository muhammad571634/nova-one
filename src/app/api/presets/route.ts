import { NextResponse } from 'next/server';
import { STYLE_PRESETS } from '@/lib/presets';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ presets: STYLE_PRESETS });
}