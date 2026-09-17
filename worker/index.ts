import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { runClaudeHeadless } from './claude-runner.ts';
import { detectMilestones } from './milestones.ts';

const DB_PATH = 'C:\\Users\\joray\\nova-one-data\\nova.db';
const CONTRACT_PATH = path.join(process.cwd(), 'worker', 'host-contract.md');

let hostContract = '';
if (fs.existsSync(CONTRACT_PATH)) {
  hostContract = fs.readFileSync(CONTRACT_PATH, 'utf8');
}

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');

console.log('✨ Nova One Worker started. Polling for queued jobs...');

let isProcessing = false;

async function checkHeygenAuth(): Promise<boolean> {
  try {
    execSync('npx hyperframes@0.8.46 auth status', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function processNextJob() {
  if (isProcessing) return;

  interface JobRow {
    id: string;
    user_id: string;
    status: string;
    source_url: string;
    brief_json: string;
    slug: string;
    job_dir: string;
    project_dir: string;
    claude_session_id?: string | null;
  }

  // Poll for any queued actionable state
  const job = db.prepare(
    "SELECT * FROM jobs WHERE status IN ('queued', 'queued_revising', 'queued_building', 'queued_rendering') ORDER BY created_at ASC LIMIT 1"
  ).get() as JobRow | undefined;

  if (!job) return;

  isProcessing = true;
  console.log(`\n🚀 Found actionable job: ${job.id} (${job.slug}) - State: ${job.status}`);

  try {
    // Determine the next target state and action
    let nextStatus = '';
    let kind: 'plan' | 'revise' | 'build' | 'edit' | 'render' | '' = '';
    let claudePrompt = '';

    if (job.status === 'queued') {
      nextStatus = 'planning';
      kind = 'plan';
      const hasUrl = Boolean(job.source_url && job.source_url.trim() && job.source_url !== 'none');
      const urlDirective = hasUrl
        ? `Source URL: ${job.source_url}.`
        : `No website URL provided. Follow the Step 1 no-capture path: do not scrape any web page, use preset design tokens, and generate scenes and script directly from BRIEF.md.`;
      claudePrompt = `Use the product-launch-video skill. The project already exists at videos/${job.slug} and BRIEF.md there is confirmed. ${urlDirective}\nRun Step 0 through Step 3 and stop at the plan checkpoint.`;
    } else if (job.status === 'queued_revising') {
      nextStatus = 'revising';
      kind = 'revise';
      claudePrompt = `Use the product-launch-video skill. The project already exists at videos/${job.slug}.\nREVISE:\nThe user submitted frame comments in videos/${job.slug}/.hyperframes/frame-comments.json.\nApply them per the review loop and stop at the plan checkpoint again.`;
    } else if (job.status === 'queued_building') {
      nextStatus = 'building';
      kind = 'build';
      claudePrompt = `Use the product-launch-video skill. The project already exists at videos/${job.slug}.\nBUILD:\nThe plan is approved. Skip the sketch pass and build in one go.\nRun Step 3.1 through the Step 6 checks and stop at the final-look question.`;
    } else if (job.status === 'queued_rendering') {
      nextStatus = 'rendering';
      kind = 'render';
    }

    // 1. Mark as preparing or working state
    const workingStatus = job.status === 'queued' ? 'preparing' : nextStatus;
    const nowIso = new Date().toISOString();
    db.prepare("UPDATE jobs SET status = ?, updated_at = ? WHERE id = ?").run(workingStatus, nowIso, job.id);

    // 2. Initial Setup if 'queued'
    if (job.status === 'queued') {
      const isAuthed = await checkHeygenAuth();
      if (!isAuthed) {
        throw new Error('HeyGen authentication missing or expired. Run npx hyperframes auth login.');
      }
      if (!fs.existsSync(job.project_dir)) {
        fs.mkdirSync(job.project_dir, { recursive: true });
      }

      const hyperframesJson = path.join(job.project_dir, 'hyperframes.json');
      const nestedMyVideo = path.join(job.project_dir, 'my-video');

      // If a previous init created a nested my-video subfolder, promote its files to project root
      if (!fs.existsSync(hyperframesJson) && fs.existsSync(nestedMyVideo)) {
        try {
          const nestedFiles = fs.readdirSync(nestedMyVideo);
          for (const file of nestedFiles) {
            const src = path.join(nestedMyVideo, file);
            const dest = path.join(job.project_dir, file);
            if (!fs.existsSync(dest)) {
              fs.renameSync(src, dest);
            }
          }
        } catch (err: any) {
          console.warn(`[Job ${job.id}] Notice promoting nested my-video files: ${err.message}`);
        }
      }

      if (!fs.existsSync(path.join(job.project_dir, 'hyperframes.json'))) {
        console.log(`[Job ${job.id}] Initializing HyperFrames project in ${job.project_dir}`);
        try {
          execSync('npx hyperframes@0.8.46 init . --non-interactive --skill=product-launch-video', {
            cwd: job.project_dir,
            stdio: 'pipe',
          });
        } catch (err: any) {
          console.warn(`[Job ${job.id}] Init notice: ${err.message}`);
        }
      }

      const sourceBrief = path.join(job.job_dir, 'BRIEF.md');
      const targetBrief = path.join(job.project_dir, 'BRIEF.md');
      if (fs.existsSync(sourceBrief)) {
        fs.copyFileSync(sourceBrief, targetBrief);
      }
      db.prepare("UPDATE jobs SET status = 'planning', updated_at = ? WHERE id = ?").run(new Date().toISOString(), job.id);
    }

    // --- RENDER FLOW ---
    if (kind === 'render') {
      console.log(`[Job ${job.id}] Spawning hyperframes render...`);
      const runStartTime = new Date().toISOString();
      try {
        execSync('npx hyperframes@0.8.46 render --skill=product-launch-video --quality high --output renders/video.mp4', {
          cwd: job.project_dir,
          stdio: 'inherit'
        });

        const mp4Path = path.join(job.project_dir, 'renders', 'video.mp4');
        let sizeBytes = 0;
        if (fs.existsSync(mp4Path)) {
          sizeBytes = fs.statSync(mp4Path).size;
        }
        const runEndTime = new Date().toISOString();
        const renderId = crypto.randomUUID();

        // Record in renders table
        db.prepare(`
          INSERT INTO renders (id, job_id, path, duration_s, size_bytes, quality, started_at, ended_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(renderId, job.id, mp4Path, null, sizeBytes, 'high', runStartTime, runEndTime);

        // Record in credit ledger
        const ledgerId = crypto.randomUUID();
        db.prepare(`
          INSERT INTO credit_ledger (id, user_id, delta, reason, job_id, ts)
          VALUES (?, ?, -1, 'Video Render (1080p)', ?, ?)
        `).run(ledgerId, job.user_id, job.id, runEndTime);

        // Record completion event
        db.prepare(`
          INSERT INTO job_events (id, job_id, ts, type, payload_json)
          VALUES (?, ?, ?, ?, ?)
        `).run(crypto.randomUUID(), job.id, runEndTime, 'status_change', JSON.stringify({
          status: 'done',
          text: 'Video rendered successfully.'
        }));

        // Final completion state
        db.prepare("UPDATE jobs SET status = 'done', updated_at = ? WHERE id = ?").run(runEndTime, job.id);
      } catch (err: any) {
        throw new Error(`Render failed: ${err.message}`);
      }
      isProcessing = false;
      return;
    }

    // --- CLAUDE FLOW (plan, revise, build) ---
    const milestoneInterval = setInterval(() => {
      try {
        const ms = detectMilestones(job.project_dir);
        db.prepare(`
          INSERT INTO job_events (id, job_id, ts, type, payload_json)
          VALUES (?, ?, ?, ?, ?)
        `).run(crypto.randomUUID(), job.id, new Date().toISOString(), 'milestone', JSON.stringify(ms));
      } catch (err) {}
    }, 2500);

    console.log(`[Job ${job.id}] Spawning claude -p ${kind.toUpperCase()}...`);
    const runStartTime = new Date().toISOString();

    const claudeSettingsDir = path.join(job.job_dir, '.claude');
    if (!fs.existsSync(claudeSettingsDir)) fs.mkdirSync(claudeSettingsDir, { recursive: true });
    
    // Inject global trust
    try {
      const globalConfigPath = 'C:/Users/joray/.claude.json';
      if (fs.existsSync(globalConfigPath)) {
        const config = JSON.parse(fs.readFileSync(globalConfigPath, 'utf8'));
        if (!config.projects) config.projects = {};
        const jobKeyFwd = job.job_dir.replace(/\\/g, '/');
        const jobKeyBck = job.job_dir.replace(/\//g, '\\');
        if (!config.projects[jobKeyFwd]) config.projects[jobKeyFwd] = {};
        if (!config.projects[jobKeyBck]) config.projects[jobKeyBck] = {};
        config.projects[jobKeyFwd].hasTrustDialogAccepted = true;
        config.projects[jobKeyBck].hasTrustDialogAccepted = true;
        fs.writeFileSync(globalConfigPath, JSON.stringify(config, null, 2));
      }
    } catch (err) {
      console.error('Failed to trust job directory in .claude.json', err);
    }

    fs.writeFileSync(
      path.join(claudeSettingsDir, 'settings.json'),
      JSON.stringify({
        permissions: {
          allow: [
            "Read(C:/Users/joray/.claude/skills/**)",
            "Read(C:\\Users\\joray\\.claude\\skills\\**)",
            "Bash(*)",
            "PowerShell(*)",
            "Read(*)",
            "Write(*)",
            "Glob(*)",
            "Grep(*)",
            "Task(*)",
            "TaskOutput(*)",
            "TaskStop(*)",
            "WebFetch(*)",
            "Skill(*)"
          ]
        }
      }, null, 2)
    );

    const result = await runClaudeHeadless({
      jobId: job.id,
      kind: kind as 'plan' | 'revise' | 'build' | 'edit',
      prompt: claudePrompt,
      cwd: job.job_dir,
      systemPromptAppend: hostContract,
      db,
      resumeSessionId: job.claude_session_id, // we should pass this to resume
      onEvent: (ev) => {
        if (ev.type === 'tool') {
          console.log(`[Job ${job.id}] 🛠️ ${ev.payload.text}`);
        }
      },
    });

    clearInterval(milestoneInterval);
    const runEndTime = new Date().toISOString();

    // Record in agent_runs table
    const runId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO agent_runs (
        id, job_id, kind, started_at, ended_at, exit_code, claude_session_id,
        total_cost_usd, input_tokens, output_tokens, cache_read_tokens,
        num_turns, subagent_stats_json, permission_denials_json,
        nova_state, log_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      runId, job.id, kind, runStartTime, runEndTime, result.exitCode ?? 0,
      result.claudeSessionId ?? null, result.totalCostUsd, result.inputTokens,
      result.outputTokens, result.cacheReadTokens, result.numTurns,
      result.subagentStats ? JSON.stringify(result.subagentStats) : null,
      result.permissionDenials ? JSON.stringify(result.permissionDenials) : null,
      result.novaState ?? null, result.logPath
    );

    // Verify disk states based on kind
    const finalMs = detectMilestones(job.project_dir);

    if (kind === 'plan' || kind === 'revise') {
      const storyboardPath = path.join(job.project_dir, 'STORYBOARD.md');
      if (fs.existsSync(storyboardPath) || finalMs.hasStoryboard) {
        db.prepare(`UPDATE jobs SET status = 'awaiting_approval', claude_session_id = ?, updated_at = ? WHERE id = ?`)
          .run(result.claudeSessionId ?? null, new Date().toISOString(), job.id);
      } else {
        throw new Error('Agent finished without creating STORYBOARD.md');
      }
    } else if (kind === 'build') {
      const contactSheetPath = path.join(job.project_dir, 'snapshots', 'contact-sheet.jpg');
      if (fs.existsSync(contactSheetPath) || finalMs.hasContactSheet) {
        db.prepare(`UPDATE jobs SET status = 'awaiting_render', claude_session_id = ?, updated_at = ? WHERE id = ?`)
          .run(result.claudeSessionId ?? null, new Date().toISOString(), job.id);
      } else {
        throw new Error('Agent finished without generating contact sheet.');
      }
    }

  } catch (err: any) {
    const currentJob = db.prepare("SELECT status FROM jobs WHERE id = ?").get(job.id) as any;
    if (currentJob?.status === 'cancelled') {
      console.log(`[Job ${job.id}] 🛑 Execution safely stopped because status is 'cancelled'.`);
      return;
    }

    console.error(`❌ [Job ${job.id}] Error:`, err.message);
    db.prepare(`
      UPDATE jobs
      SET status = 'failed',
          error = ?,
          updated_at = ?
      WHERE id = ?
    `).run(err.message, new Date().toISOString(), job.id);
  } finally {
    isProcessing = false;
  }
}

// Polling tick
setInterval(processNextJob, 3000);