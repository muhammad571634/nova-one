import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { generateBriefMarkdown, BriefConfig } from '@/lib/brief';

export const dynamic = 'force-dynamic';

function slugifyUrl(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    let host = parsed.hostname.replace(/^www\./, '');
    const cleanHost = host.replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return cleanHost.toLowerCase() || 'product-video';
  } catch {
    return 'product-video';
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.balance < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please upgrade your plan in Billing.' },
        { status: 402 }
      );
    }

    const body = await request.json();
    const { url, intent = 'promote', stylePreset = 'auto', length = '45s', voice = 'female', language = 'en', keyMessage } = body;

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return NextResponse.json(
        { error: 'Please enter a valid website URL including http:// or https://' },
        { status: 400 }
      );
    }

    const briefConfig: BriefConfig = {
      url: url.trim(),
      intent: intent === 'show_site' ? 'show_site' : 'promote',
      stylePreset: typeof stylePreset === 'string' ? stylePreset : 'auto',
      length: ['30s', '45s', '60s'].includes(length) ? length : '45s',
      voice: voice === 'male' ? 'male' : 'female',
      language: typeof language === 'string' ? language : 'en',
      keyMessage: typeof keyMessage === 'string' ? keyMessage.trim() : undefined,
    };

    const briefMarkdown = generateBriefMarkdown(briefConfig);
    const slug = slugifyUrl(briefConfig.url);
    const jobId = `job_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;

    const jobDir = path.join('C:\\Users\\joray\\nova-one-data\\jobs', jobId);
    const projectDir = path.join(jobDir, 'videos', slug);
    const logsDir = path.join(jobDir, 'logs');

    fs.mkdirSync(jobDir, { recursive: true });
    fs.mkdirSync(projectDir, { recursive: true });
    fs.mkdirSync(logsDir, { recursive: true });

    // Save BRIEF.md inside job directory for inspection
    fs.writeFileSync(path.join(jobDir, 'BRIEF.md'), briefMarkdown, 'utf8');

    const db = getDb();
    const nowIso = new Date().toISOString();

    // Insert job with queued status
    db.prepare(`
      INSERT INTO jobs (
        id, user_id, status, source_url, brief_json, slug,
        job_dir, project_dir, error, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      jobId,
      user.id,
      'queued',
      briefConfig.url,
      JSON.stringify(briefConfig),
      slug,
      jobDir,
      projectDir,
      null,
      nowIso,
      nowIso
    );

    // Record credit ledger debit
    const ledgerId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO credit_ledger (id, user_id, delta, reason, job_id, ts)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      ledgerId,
      user.id,
      -1,
      'create_video_job',
      jobId,
      nowIso
    );

    return NextResponse.json({
      success: true,
      jobId,
      slug,
    });
  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating the video job.' },
      { status: 500 }
    );
  }
}