import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb, Job } from '@/lib/db';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { parseStoryboardMarkdown, serializeStoryboardMarkdown, StoryboardFrame } from '@/lib/storyboard-parser';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const job = (db.prepare('SELECT * FROM jobs WHERE id = ? AND user_id = ?').get(id, session.id) as unknown) as Job | undefined;

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const storyboardPath = path.join(job.project_dir, 'STORYBOARD.md');
    if (!fs.existsSync(storyboardPath)) {
      return NextResponse.json({ success: true, storyboard: null, frames: [] });
    }

    const content = fs.readFileSync(storyboardPath, 'utf8');
    const parsed = parseStoryboardMarkdown(content);

    return NextResponse.json({
      success: true,
      storyboard: parsed,
      frames: parsed.frames,
    });
  } catch (error) {
    console.error('Get scenes error:', error);
    return NextResponse.json({ error: 'Failed to retrieve scenes.' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const job = (db.prepare('SELECT * FROM jobs WHERE id = ? AND user_id = ?').get(id, session.id) as unknown) as Job | undefined;

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const body = await request.json();
    const { frames } = body as { frames: StoryboardFrame[] };

    if (!Array.isArray(frames) || frames.length === 0) {
      return NextResponse.json({ error: 'Frames array is required.' }, { status: 400 });
    }

    const storyboardPath = path.join(job.project_dir, 'STORYBOARD.md');
    let parsed = { frames: [] as StoryboardFrame[] };

    if (fs.existsSync(storyboardPath)) {
      const existing = fs.readFileSync(storyboardPath, 'utf8');
      parsed = parseStoryboardMarkdown(existing);
    }

    // Merge updated frame properties
    parsed.frames = frames.map((fr, idx) => ({
      id: fr.id || idx + 1,
      title: fr.title?.trim() || `Scene ${idx + 1}`,
      scene: fr.scene?.trim() || fr.title?.trim() || `Scene ${idx + 1}`,
      voiceover: fr.voiceover?.trim() || '',
      duration: typeof fr.duration === 'number' ? `${fr.duration}s` : fr.duration || '5s',
      type: fr.type || 'scene',
      status: fr.status || 'approved',
    }));

    // Save serialized markdown back to STORYBOARD.md
    const newMarkdown = serializeStoryboardMarkdown(parsed);
    fs.writeFileSync(storyboardPath, newMarkdown, 'utf8');

    // Also write to job_dir if distinct
    const jobDirStoryboard = path.join(job.job_dir, 'STORYBOARD.md');
    if (job.job_dir !== job.project_dir) {
      try {
        fs.writeFileSync(jobDirStoryboard, newMarkdown, 'utf8');
      } catch {}
    }

    const nowIso = new Date().toISOString();

    // Log update event
    db.prepare(`
      INSERT INTO job_events (id, job_id, ts, type, payload_json)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      job.id,
      nowIso,
      'status_change',
      JSON.stringify({
        status: job.status,
        text: `Updated ${frames.length} scenes in Simple Visual Editor.`,
      })
    );

    return NextResponse.json({
      success: true,
      storyboard: parsed,
      message: 'Scenes saved successfully.',
    });
  } catch (error) {
    console.error('Update scenes error:', error);
    return NextResponse.json({ error: 'Failed to update scenes.' }, { status: 500 });
  }
}
