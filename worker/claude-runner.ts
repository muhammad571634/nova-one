import { spawn } from 'node:child_process';
import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

export interface ClaudeRunOptions {
  jobId: string;
  kind: 'plan' | 'revise' | 'build' | 'edit';
  prompt: string;
  cwd: string;
  systemPromptAppend?: string;
  resumeSessionId?: string | null;
  db: DatabaseSync;
  onEvent?: (event: { type: string; payload: any }) => void;
  timeoutMs?: number;
}

export interface ClaudeRunResult {
  exitCode: number | null;
  claudeSessionId?: string;
  novaState?: string;
  totalCostUsd: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  numTurns: number;
  subagentStats?: any;
  permissionDenials?: any;
  logPath: string;
  error?: string;
}

function sanitizeText(text: string): string {
  return text.replace(/(?:sk-[a-zA-Z0-9_-]{20,}|Bearer\s+[a-zA-Z0-9._-]+)/gi, '[REDACTED]');
}

export function runClaudeHeadless(options: ClaudeRunOptions): Promise<ClaudeRunResult> {
  return new Promise((resolve) => {
    const {
      jobId,
      kind,
      prompt,
      cwd,
      systemPromptAppend,
      resumeSessionId,
      db,
      onEvent,
      timeoutMs = 1800000, // 30 min safety watchdog
    } = options;

    const logsDir = path.join(cwd, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const logPath = path.join(logsDir, `run-${kind}.jsonl`);
    const logStream = fs.createWriteStream(logPath, { flags: 'a', encoding: 'utf8' });

    const args = [
      '--print',
      '--output-format',
      'stream-json',
      '--verbose',
      '--dangerously-skip-permissions',
    ];

    if (resumeSessionId) {
      args.push('--resume', resumeSessionId);
    }

    if (systemPromptAppend) {
      args.push('--append-system-prompt', systemPromptAppend);
    }

    const commandStr = 'claude.cmd';

    // Insert start event into DB
    const startEventId = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    db.prepare(`
      INSERT INTO job_events (id, job_id, ts, type, payload_json)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      startEventId,
      jobId,
      nowIso,
      'run_start',
      JSON.stringify({ kind, prompt })
    );

    const child = spawn(commandStr, args, {
      cwd,
      shell: true,
      env: {
        ...process.env,
        CI: '1',
      },
    });

    if (child.stdin) {
      child.stdin.write(prompt + '\n');
      child.stdin.end();
    }

    let totalCostUsd = 0;
    let inputTokens = 0;
    let outputTokens = 0;
    let cacheReadTokens = 0;
    let numTurns = 0;
    let claudeSessionId = resumeSessionId || undefined;
    let novaState: string | undefined;
    let subagentStats: any = null;
    let permissionDenials: any = null;
    let errorMsg: string | undefined;

    // Watchdog
    const timeoutTimer = setTimeout(() => {
      errorMsg = `Watchdog timeout: ${kind} run exceeded ${timeoutMs / 1000}s.`;
      if (child.pid) {
        spawn('taskkill', ['/PID', child.pid.toString(), '/T', '/F'], { shell: true });
      }
    }, timeoutMs);

    // Realtime cancellation watchdog (checks every 1s if user clicked Stop)
    const cancelCheckInterval = setInterval(() => {
      try {
        const currentJob = db.prepare("SELECT status FROM jobs WHERE id = ?").get(jobId) as any;
        if (currentJob?.status === 'cancelled') {
          clearInterval(cancelCheckInterval);
          clearTimeout(timeoutTimer);
          errorMsg = 'Job was cancelled by user.';
          if (child.pid) {
            spawn('taskkill', ['/PID', child.pid.toString(), '/T', '/F'], { shell: true });
          }
        }
      } catch {}
    }, 1000);

    if (child.stdout) {
      const rl = readline.createInterface({ input: child.stdout });
      rl.on('line', (line) => {
        if (!line.trim()) return;
        const sanitized = sanitizeText(line);
        logStream.write(sanitized + '\n');

        try {
          const parsed = JSON.parse(line);

          // Capture session ID
          if (parsed.session_id) {
            claudeSessionId = parsed.session_id;
          }

          // Capture stats from summary/result
          if (parsed.total_cost_usd !== undefined) {
            totalCostUsd = parsed.total_cost_usd;
          }
          if (parsed.num_turns !== undefined) {
            numTurns = parsed.num_turns;
          }
          if (parsed.subagent_stats) {
            subagentStats = parsed.subagent_stats;
          }
          if (parsed.permission_denials) {
            permissionDenials = parsed.permission_denials;
          }
          if (parsed.usage) {
            inputTokens = parsed.usage.input_tokens || inputTokens;
            outputTokens = parsed.usage.output_tokens || outputTokens;
            cacheReadTokens = parsed.usage.cache_read_tokens || cacheReadTokens;
          }

          // Capture NOVA_STATE from assistant content or text
          if (typeof parsed.result === 'string') {
            const match = parsed.result.match(/NOVA_STATE:\s*([^\n\r]+)/);
            if (match) {
              novaState = match[1].trim();
            }
          }

          // Emit to DB and callback
          let eventType = 'log';
          let payloadText = '';

          if (parsed.type === 'tool_use' || parsed.tool_use) {
            eventType = 'tool';
            payloadText = `Running tool: ${parsed.tool_use?.name || parsed.name || 'action'}`;
          } else if (parsed.type === 'message' || parsed.type === 'assistant') {
            eventType = 'step';
            
            if (parsed.message?.content && Array.isArray(parsed.message.content)) {
              const textChunk = parsed.message.content.find((c: any) => c.type === 'text');
              payloadText = textChunk ? textChunk.text.slice(0, 300) : 'Generating content...';
            } else {
              payloadText = typeof parsed.content === 'string' ? parsed.content.slice(0, 300) : 'Generating content...';
            }
          } else if (parsed.type === 'error') {
            eventType = 'error';
            payloadText = parsed.error || 'Agent error';
          }

          if (payloadText) {
            const eventPayload = {
              type: eventType,
              text: payloadText,
              raw: parsed,
            };
            const eventId = crypto.randomUUID();
            db.prepare(`
              INSERT INTO job_events (id, job_id, ts, type, payload_json)
              VALUES (?, ?, ?, ?, ?)
            `).run(
              eventId,
              jobId,
              new Date().toISOString(),
              eventType,
              JSON.stringify(eventPayload)
            );

            if (onEvent) {
              onEvent({ type: eventType, payload: eventPayload });
            }
          }
        } catch {
          // Line wasn't JSON, write as raw log
          const eventId = crypto.randomUUID();
          db.prepare(`
            INSERT INTO job_events (id, job_id, ts, type, payload_json)
            VALUES (?, ?, ?, ?, ?)
          `).run(
            eventId,
            jobId,
            new Date().toISOString(),
            'log',
            JSON.stringify({ text: sanitized.slice(0, 300) })
          );
        }
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (data) => {
        const errStr = sanitizeText(data.toString());
        logStream.write(`[STDERR] ${errStr}\n`);
      });
    }

    child.on('error', (err) => {
      errorMsg = err.message;
    });

    child.on('close', (code) => {
      clearTimeout(timeoutTimer);
      clearInterval(cancelCheckInterval);
      logStream.end();

      // Record run completion event
      const endEventId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO job_events (id, job_id, ts, type, payload_json)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        endEventId,
        jobId,
        new Date().toISOString(),
        'run_end',
        JSON.stringify({
          kind,
          exitCode: code,
          totalCostUsd,
          numTurns,
          novaState,
          error: errorMsg,
        })
      );

      resolve({
        exitCode: code,
        claudeSessionId,
        novaState,
        totalCostUsd,
        inputTokens,
        outputTokens,
        cacheReadTokens,
        numTurns,
        subagentStats,
        permissionDenials,
        logPath,
        error: errorMsg,
      });
    });
  });
}