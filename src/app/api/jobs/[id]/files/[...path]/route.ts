import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb, Job } from "@/lib/db";
import fs from "node:fs";
import path from "node:path";

// Supported MIME types
const MIME_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; path: string[] }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json({ error: "Path required" }, { status: 400 });
    }

    const db = getDb();
    const job = (db.prepare(
      "SELECT * FROM jobs WHERE id = ? AND user_id = ?"
    ).get(id, session.id) as unknown) as Job | undefined;

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const relativeSubPath = pathSegments.join(path.sep);

    // Primary search path is inside job.project_dir (videos/<slug>/...)
    // Secondary fallback is job.job_dir
    const candidatePath1 = path.resolve(job.project_dir, relativeSubPath);
    const candidatePath2 = path.resolve(job.job_dir, relativeSubPath);

    let targetFilePath: string | null = null;

    // Strict Path Traversal Protection: must resolve within project_dir or job_dir
    const normalizedProjDir = path.resolve(job.project_dir) + path.sep;
    const normalizedJobDir = path.resolve(job.job_dir) + path.sep;

    if (
      candidatePath1.startsWith(normalizedProjDir) &&
      fs.existsSync(candidatePath1) &&
      fs.statSync(candidatePath1).isFile()
    ) {
      targetFilePath = candidatePath1;
    } else if (
      candidatePath2.startsWith(normalizedJobDir) &&
      fs.existsSync(candidatePath2) &&
      fs.statSync(candidatePath2).isFile()
    ) {
      targetFilePath = candidatePath2;
    }

    if (!targetFilePath) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const ext = path.extname(targetFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const stat = fs.statSync(/*turbopackIgnore: true*/ targetFilePath);
    const fileSize = stat.size;

    // Range Request Handling (Crucial for Video Streaming / Seeking)
    const range = request.headers.get("range");

    if (range && contentType.startsWith("video/")) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            "Content-Range": `bytes */${fileSize}`,
          },
        });
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(/*turbopackIgnore: true*/ targetFilePath, { start, end });
      const stream = new ReadableStream({
        start(controller) {
          fileStream.on("data", (chunk) => controller.enqueue(chunk));
          fileStream.on("end", () => controller.close());
          fileStream.on("error", (err) => controller.error(err));
        },
        cancel() {
          fileStream.destroy();
        },
      });

      return new NextResponse(stream as any, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
          "Cache-Control": "no-cache",
        },
      });
    }

    // Standard Full-File Response via Streaming
    const fileStream = fs.createReadStream(/*turbopackIgnore: true*/ targetFilePath);
    const stream = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      },
      cancel() {
        fileStream.destroy();
      },
    });

    const isDownload = request.nextUrl.searchParams.get("download") === "true";
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Length": fileSize.toString(),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600",
    };

    if (isDownload) {
      const fileName = path.basename(targetFilePath);
      headers["Content-Disposition"] = `attachment; filename="${fileName}"`;
    }

    return new NextResponse(stream as any, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error("Error serving file:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
