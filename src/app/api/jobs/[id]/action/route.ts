import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import fs from "node:fs";
import path from "node:path";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, payload } = body;

    const db = getDb();
    
    // Check if job exists and belongs to user
    const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as any;
    
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (job.user_id !== session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const now = new Date().toISOString();

    if (action === "revise") {
      if (!payload?.comments) {
        return NextResponse.json({ error: "Comments required for revise action" }, { status: 400 });
      }

      // Write comments to .hyperframes/frame-comments.json
      const hfDir = path.join(job.project_dir, ".hyperframes");
      if (!fs.existsSync(hfDir)) {
        fs.mkdirSync(hfDir, { recursive: true });
      }
      
      const commentsPath = path.join(hfDir, "frame-comments.json");
      fs.writeFileSync(commentsPath, JSON.stringify(payload.comments, null, 2), "utf8");

      // Update status to queued_revising
      db.prepare("UPDATE jobs SET status = ?, updated_at = ? WHERE id = ?").run("queued_revising", now, id);
      
      return NextResponse.json({ success: true, status: "queued_revising" });
    }

    if (action === "build") {
      // Update status to queued_building
      db.prepare("UPDATE jobs SET status = ?, updated_at = ? WHERE id = ?").run("queued_building", now, id);
      return NextResponse.json({ success: true, status: "queued_building" });
    }

    if (action === "render") {
      // Update status to queued_rendering
      db.prepare("UPDATE jobs SET status = ?, updated_at = ? WHERE id = ?").run("queued_rendering", now, id);
      return NextResponse.json({ success: true, status: "queued_rendering" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
