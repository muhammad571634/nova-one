import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb, Job } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const job = (db.prepare(
      'SELECT * FROM jobs WHERE id = ? AND user_id = ?'
    ).get(id, user.id) as unknown) as Job | undefined;

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    let briefConfig = {};
    try {
      briefConfig = JSON.parse(job.brief_json);
    } catch {
      briefConfig = {};
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        slug: job.slug,
        status: job.status,
        source_url: job.source_url,
        briefConfig,
        created_at: job.created_at,
        updated_at: job.updated_at,
      },
    });
  } catch (error) {
    console.error('Fetch job error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve job details.' },
      { status: 500 }
    );
  }
}
