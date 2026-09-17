import React from 'react';
import { notFound } from 'next/navigation';
import fs from 'node:fs';
import path from 'node:path';
import { getCurrentUser } from '@/lib/auth';
import { getDb, Job } from '@/lib/db';
import ProjectLiveTracker from '@/components/ProjectLiveTracker';
import { parseStoryboardMarkdown, ParsedStoryboard } from '@/lib/storyboard-parser';

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const user = await getCurrentUser();
  const db = getDb();

  const job = (db.prepare(
    'SELECT * FROM jobs WHERE id = ? AND user_id = ?'
  ).get(id, user!.id) as unknown) as Job | undefined;

  if (!job) {
    notFound();
  }

  let briefConfig: any = {};
  try {
    briefConfig = JSON.parse(job.brief_json);
  } catch {
    briefConfig = {};
  }

  let briefMarkdown = '';
  const projectBrief = path.join(job.project_dir, 'BRIEF.md');
  const jobBrief = path.join(job.job_dir, 'BRIEF.md');

  if (fs.existsSync(projectBrief)) {
    briefMarkdown = fs.readFileSync(projectBrief, 'utf8');
  } else if (fs.existsSync(jobBrief)) {
    briefMarkdown = fs.readFileSync(jobBrief, 'utf8');
  }

  let storyboard: ParsedStoryboard | null = null;
  const storyboardPath = path.join(job.project_dir, 'STORYBOARD.md');
  if (fs.existsSync(storyboardPath)) {
    try {
      const sbContent = fs.readFileSync(storyboardPath, 'utf8');
      storyboard = parseStoryboardMarkdown(sbContent);
    } catch (err) {
      console.error('Failed to parse storyboard markdown:', err);
    }
  }

  // Query render records and agent runs for metrics & preview
  const rawRenderRecord = db.prepare(
    'SELECT * FROM renders WHERE job_id = ? ORDER BY started_at DESC LIMIT 1'
  ).get(job.id) as any;

  const rawAgentRuns = db.prepare(
    'SELECT * FROM agent_runs WHERE job_id = ? ORDER BY started_at ASC'
  ).all(job.id) as any[];

  // Convert SQLite null-prototype objects to plain JS objects for RSC serialization
  const renderRecord = rawRenderRecord ? { ...rawRenderRecord } : null;
  const agentRuns = (rawAgentRuns || []).map((r) => ({ ...r }));

  const mp4Path = path.join(job.project_dir, 'renders', 'video.mp4');
  const hasRenderedVideo = fs.existsSync(mp4Path);
  const videoSizeBytes = hasRenderedVideo ? fs.statSync(mp4Path).size : 0;

  const contactSheetPath = path.join(job.project_dir, 'snapshots', 'contact-sheet.jpg');
  const hasContactSheet = fs.existsSync(contactSheetPath);

  return (
    <ProjectLiveTracker
      jobId={job.id}
      slug={job.slug}
      sourceUrl={job.source_url}
      initialStatus={job.status}
      briefConfig={briefConfig}
      briefMarkdown={briefMarkdown}
      initialStoryboard={storyboard}
      hasRenderedVideo={hasRenderedVideo}
      videoSizeBytes={videoSizeBytes}
      hasContactSheet={hasContactSheet}
      renderRecord={renderRecord || null}
      agentRuns={agentRuns || []}
    />
  );
}