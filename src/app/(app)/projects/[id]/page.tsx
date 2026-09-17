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

  return (
    <ProjectLiveTracker
      jobId={job.id}
      slug={job.slug}
      sourceUrl={job.source_url}
      initialStatus={job.status}
      briefConfig={briefConfig}
      briefMarkdown={briefMarkdown}
      initialStoryboard={storyboard}
    />
  );
}