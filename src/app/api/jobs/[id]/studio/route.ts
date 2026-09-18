import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb, Job } from "@/lib/db";
import { startStudio, stopStudio, getStudioStatus } from "@/lib/studio";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const job = (db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as unknown) as Job | undefined;

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (job.user_id !== session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const status = await getStudioStatus(job.id);
    return NextResponse.json({ success: true, ...status });
  } catch (error: any) {
    console.error("Studio GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to get studio status" }, { status: 500 });
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const job = (db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as unknown) as Job | undefined;

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (job.user_id !== session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const result = await startStudio({
      id: job.id,
      slug: job.slug,
      project_dir: job.project_dir,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Studio POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to start studio" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const job = (db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as unknown) as Job | undefined;

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (job.user_id !== session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const result = await stopStudio(job.id, job.project_dir);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Studio DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to stop studio" }, { status: 500 });
  }
}
