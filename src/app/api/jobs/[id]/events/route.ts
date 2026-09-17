import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb, Job } from '@/lib/db';
import { detectMilestones } from '../../../../../../worker/milestones';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const user = await getCurrentUser();

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const db = getDb();
  const job = (db.prepare(
    'SELECT * FROM jobs WHERE id = ? AND user_id = ?'
  ).get(id, user.id) as unknown) as Job | undefined;

  if (!job) {
    return new NextResponse('Job not found', { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sentEventIds = new Set<string>();
      let isAlive = true;

      request.signal.addEventListener('abort', () => {
        isAlive = false;
        try {
          controller.close();
        } catch {
          // ignore
        }
      });

      const interval = setInterval(() => {
        if (!isAlive) {
          clearInterval(interval);
          return;
        }

        try {
          // Query current job status
          interface CurrentJobStatus {
            status: string;
            error?: string | null;
          }
          const currentJob = (db.prepare('SELECT status, error FROM jobs WHERE id = ?').get(id) as unknown) as CurrentJobStatus | undefined;
          const currentStatus = currentJob?.status || 'queued';
          const currentError = currentJob?.error || null;

          // Query milestones
          const milestones = detectMilestones(job.project_dir);

          // Query new events
          interface JobEventRow {
            id: string;
            ts: string;
            type: string;
            payload_json: string;
          }

          const events = (db.prepare(
            'SELECT id, ts, type, payload_json FROM job_events WHERE job_id = ? ORDER BY ts ASC'
          ).all(id) as unknown) as JobEventRow[];

          const newEvents: any[] = [];
          for (const ev of events) {
            if (!sentEventIds.has(ev.id)) {
              sentEventIds.add(ev.id);
              let payload = {};
              try {
                payload = JSON.parse(ev.payload_json);
              } catch {
                payload = { raw: ev.payload_json };
              }
              newEvents.push({
                id: ev.id,
                ts: ev.ts,
                type: ev.type,
                payload,
              });
            }
          }

          const payload = JSON.stringify({
            status: currentStatus,
            error: currentError,
            milestones,
            newEvents,
          });

          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));

          // If terminal status, wait a bit and close
          if (['awaiting_approval', 'awaiting_render', 'done', 'failed'].includes(currentStatus)) {
            setTimeout(() => {
              if (isAlive) {
                isAlive = false;
                clearInterval(interval);
                try {
                  controller.close();
                } catch {
                  // ignore
                }
              }
            }, 3000);
          }
        } catch (err) {
          console.error('SSE loop error:', err);
          clearInterval(interval);
          try {
            controller.close();
          } catch {
            // ignore
          }
        }
      }, 800);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}