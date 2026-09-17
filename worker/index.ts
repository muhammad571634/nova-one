import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { runClaudeHeadless } from './claude-runner';
import { detectMilestones } from './milestones';

const DB_PATH = 'C:\\Users\\joray\\nova-one-data\\nova.db';
const CONTRACT_PATH = path.join(process.cwd(), 'worker', 'host-contract.md');

let hostContract = '';
if (fs.existsSync(CONTRACT_PATH)) {
  hostContract = fs.readFileSync(CONTRACT_PATH, 'utf8');
}

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');

console.log('⚡ Nova One Worker started. Polling for queued jobs...');

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

  const job = db.prepare(
    "SELECT * FROM jobs WHERE status = 'queued' ORDER BY created_at ASC LIMIT 1"
  ).get() as JobRow | undefined;

  if (!job) return;

  isProcessing = true;
  console.log(`\n▶ Found queued job: ${job.id} (${job.slug}) for URL: ${job.source_url}`);

  try {
    // 1. Mark as preparing
    const nowIso = new Date().toISOString();
    db.prepare("UPDATE jobs SET status = 'preparing', updated_at = ? WHERE id = ?").run(nowIso, job.id);

    // 2. Verify Auth
    const isAuthed = await checkHeygenAuth();
    if (!isAuthed) {
      throw new Error('HeyGen authentication missing or expired. Run npx hyperframes auth login.');
    }

    // 3. Setup project directory & HyperFrames init
    if (!fs.existsSync(job.project_dir)) {
      fs.mkdirSync(job.project_dir, { recursive: true });
    }

    const hyperframesJson = path.join(job.project_dir, 'hyperframes.json');
    if (!fs.existsSync(hyperframesJson)) {
      console.log(`[Job ${job.id}] Initializing HyperFrames project in ${job.project_dir}`);
      try {
        execSync('npx hyperframes@0.8.46 init', { cwd: job.project_dir, stdio: 'pipe' });
      } catch (err: any) {
        console.warn(`[Job ${job.id}] Init notice: ${err.message}`);
      }
    }

    // 4. Ensure BRIEF.md is copied into project directory
    const sourceBrief = path.join(job.job_dir, 'BRIEF.md');
    const targetBrief = path.join(job.project_dir, 'BRIEF.md');
    if (fs.existsSync(sourceBrief)) {
      fs.copyFileSync(sourceBrief, targetBrief);
      console.log(`[Job ${job.id}] BRIEF.md copied to ${targetBrief}`);
    }

    // 5. Mark as planning
    db.prepare("UPDATE jobs SET status = 'planning', updated_at = ? WHERE id = ?").run(
      new Date().toISOString(),
      job.id
    );

    // 6. Start milestone tracking interval
    const milestoneInterval = setInterval(() => {
      try {
        const ms = detectMilestones(job.project_dir);
        const eventId = crypto.randomUUID();
        db.prepare(`
          INSERT INTO job_events (id, job_id, ts, type, payload_json)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          eventId,
          job.id,
          new Date().toISOString(),
          'milestone',
          JSON.stringify(ms)
        );
      } catch (err) {
        // ignore
      }
    }, 2500);

    // 7. Execute Claude Code PLAN run
    const planPrompt = `Use the product-launch-video skill. The project already exists at videos/${job.slug} and BRIEF.md there is confirmed. Source URL: ${job.source_url}.\nRun Step 0 through Step 3 and stop at the plan checkpoint.`;

    console.log(`[Job ${job.id}] Spawning claude -p PLAN...`);
    const runStartTime = new Date().toISOString();

    const result = await runClaudeHeadless({
      jobId: job.id,
      kind: 'plan',
      prompt: planPrompt,
      cwd: job.job_dir,
      systemPromptAppend: hostContract,
      db,
      resumeSessionId: job.claude_session_id,
      onEvent: (ev) => {
        if (ev.type === 'tool') {
          console.log(`[Job ${job.id}] ⚙️ ${ev.payload.text}`);
        }
      },
    });

    clearInterval(milestoneInterval);
    const runEndTime = new Date().toISOString();

    // 8. Record in agent_runs table
    const runId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO agent_runs (
        id, job_id, kind, started_at, ended_at, exit_code, claude_session_id,
        total_cost_usd, input_tokens, output_tokens, cache_read_tokens,
        num_turns, subagent_stats_json, permission_denials_json,
        nova_state, log_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      runId,
      job.id,
      'plan',
      runStartTime,
      runEndTime,
      result.exitCode ?? 0,
      result.claudeSessionId ?? null,
      result.totalCostUsd,
      result.inputTokens,
      result.outputTokens,
      result.cacheReadTokens,
      result.numTurns,
      result.subagentStats ? JSON.stringify(result.subagentStats) : null,
      result.permissionDenials ? JSON.stringify(result.permissionDenials) : null,
      result.novaState ?? null,
      result.logPath
    );

    // 9. Verify STORYBOARD.md existence on disk per PLAN.md § 7.3
    const storyboardPath = path.join(job.project_dir, 'STORYBOARD.md');
    const finalMs = detectMilestones(job.project_dir);

    if (fs.existsSync(storyboardPath) || finalMs.hasStoryboard) {
      console.log(`✅ [Job ${job.id}] STORYBOARD.md created! Transitioning to awaiting_approval`);
      db.prepare(`
        UPDATE jobs
        SET status = 'awaiting_approval',
            claude_session_id = ?,
            updated_at = ?
        WHERE id = ?
      `).run(result.claudeSessionId ?? null, new Date().toISOString(), job.id);
    } else {
      console.error(`❌ [Job ${job.id}] STORYBOARD.md not found. Agent ended without completing plan.`);
      db.prepare(`
        UPDATE jobs
        SET status = 'failed',
            error = ?,
            updated_at = ?
        WHERE id = ?
      `).run(
        result.error || 'Agent finished without creating STORYBOARD.md',
        new Date().toISOString(),
        job.id
      );
    }
  } catch (err: any) {
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