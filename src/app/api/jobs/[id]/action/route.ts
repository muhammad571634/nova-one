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

    if (action === "cancel") {
      db.prepare("UPDATE jobs SET status = ?, updated_at = ? WHERE id = ?").run("cancelled", now, id);
      
      const eventId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO job_events (id, job_id, ts, type, payload_json)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        eventId,
        id,
        now,
        "status_change",
        JSON.stringify({ status: "cancelled", text: "Generation stopped by user." })
      );

      return NextResponse.json({ success: true, status: "cancelled" });
    }

    if (action === "restart") {
      // Clear old log file to prevent Claude from misinterpreting stale errors
      const runPlanLog = path.join(job.job_dir, "logs", "run-plan.jsonl");
      if (fs.existsSync(runPlanLog)) {
        try { fs.unlinkSync(runPlanLog); } catch {}
      }

      db.prepare("UPDATE jobs SET status = ?, error = NULL, claude_session_id = NULL, updated_at = ? WHERE id = ?")
        .run("queued", now, id);

      const eventId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO job_events (id, job_id, ts, type, payload_json)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        eventId,
        id,
        now,
        "status_change",
        JSON.stringify({ status: "queued", text: "Job restarted by user." })
      );

      return NextResponse.json({ success: true, status: "queued" });
    }

    if (action === "edit_brief") {
      const { url, intent, stylePreset, length, voice, keyMessage, language, aspect, captions, brandColor, brandName } = payload || {};
      
      let currentBrief: any = {};
      try {
        currentBrief = JSON.parse(job.brief_json || "{}");
      } catch {}

      const updatedConfig = {
        url: typeof url === "string" ? url.trim() : (currentBrief.url || job.source_url || ""),
        intent: intent === "show_site" ? "show_site" : "promote",
        stylePreset: typeof stylePreset === "string" ? stylePreset : (currentBrief.stylePreset || "auto"),
        length: ["15s", "30s", "45s", "60s"].includes(length) ? length : (currentBrief.length || "45s"),
        voice: voice === "male" ? "male" : "female",
        language: typeof language === "string" ? language : (currentBrief.language || "en"),
        keyMessage: typeof keyMessage === "string" ? keyMessage.trim() : currentBrief.keyMessage,
        aspect: aspect || currentBrief.aspect || "1920x1080",
        captions: typeof captions === "boolean" ? captions : (currentBrief.captions !== false),
        brandColor: typeof brandColor === "string" && brandColor.trim() ? brandColor.trim() : currentBrief.brandColor,
        brandName: typeof brandName === "string" && brandName.trim() ? brandName.trim() : currentBrief.brandName,
      };

      const { generateBriefMarkdown } = await import("@/lib/brief");
      const newBriefMarkdown = generateBriefMarkdown(updatedConfig as any);

      // Write updated BRIEF.md to job_dir and project_dir
      if (fs.existsSync(job.job_dir)) {
        fs.writeFileSync(path.join(job.job_dir, "BRIEF.md"), newBriefMarkdown, "utf8");
      }
      if (fs.existsSync(job.project_dir)) {
        fs.writeFileSync(path.join(job.project_dir, "BRIEF.md"), newBriefMarkdown, "utf8");
      }

      // If user specified a custom brandColor, ensure capture/extracted/tokens.json is primed
      if (updatedConfig.brandColor && job.project_dir) {
        const extractedDir = path.join(job.project_dir, "capture", "extracted");
        if (!fs.existsSync(extractedDir)) {
          fs.mkdirSync(extractedDir, { recursive: true });
        }
        const tokensPath = path.join(extractedDir, "tokens.json");
        let existingTokens: any = { colors: [], fonts: [] };
        if (fs.existsSync(tokensPath)) {
          try {
            existingTokens = JSON.parse(fs.readFileSync(tokensPath, "utf8"));
          } catch {}
        }
        const cleanBrandHex = updatedConfig.brandColor.startsWith("#") ? updatedConfig.brandColor : `#${updatedConfig.brandColor}`;
        const existingColors = (existingTokens.colors || []).filter((c: any) => {
          const hex = typeof c === "string" ? c : c?.hex;
          return hex && hex.toLowerCase() !== cleanBrandHex.toLowerCase();
        });
        existingTokens.colors = [cleanBrandHex, ...existingColors];
        fs.writeFileSync(tokensPath, JSON.stringify(existingTokens, null, 2), "utf8");
      }

      // Clear old logs so Claude starts completely fresh
      const logsDir = path.join(job.job_dir, "logs");
      if (fs.existsSync(logsDir)) {
        try {
          const files = fs.readdirSync(logsDir);
          for (const f of files) {
            fs.unlinkSync(path.join(logsDir, f));
          }
        } catch {}
      }

      // If brief was edited, clean up old plan artifacts so agent creates fresh storyboard
      if (job.project_dir && fs.existsSync(job.project_dir)) {
        const oldStoryboard = path.join(job.project_dir, "STORYBOARD.md");
        const oldScript = path.join(job.project_dir, "SCRIPT.md");
        const oldFrame = path.join(job.project_dir, "frame.md");
        if (fs.existsSync(oldStoryboard)) try { fs.unlinkSync(oldStoryboard); } catch {}
        if (fs.existsSync(oldScript)) try { fs.unlinkSync(oldScript); } catch {}
        if (fs.existsSync(oldFrame)) try { fs.unlinkSync(oldFrame); } catch {}

        // If URL was cleared or changed, remove old capture directory
        if (!updatedConfig.url || updatedConfig.url !== currentBrief.url) {
          const oldCapture = path.join(job.project_dir, "capture");
          if (fs.existsSync(oldCapture)) {
            try { fs.rmSync(oldCapture, { recursive: true, force: true }); } catch {}
          }
        }
      }

      db.prepare(`
        UPDATE jobs 
        SET status = 'queued',
            source_url = ?,
            brief_json = ?,
            error = NULL,
            claude_session_id = NULL,
            updated_at = ?
        WHERE id = ?
      `).run(updatedConfig.url, JSON.stringify(updatedConfig), now, id);

      const eventId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO job_events (id, job_id, ts, type, payload_json)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        eventId,
        id,
        now,
        "status_change",
        JSON.stringify({ status: "queued", text: "Brief updated with new instructions and restarted." })
      );

      return NextResponse.json({ success: true, status: "queued" });
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
