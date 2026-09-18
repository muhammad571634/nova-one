import { spawn } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';

export interface StudioSession {
  jobId: string;
  slug: string;
  projectDir: string;
  port: number;
  pid?: number;
  url: string;
  startedAt: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __nova_studio_sessions__: Map<string, StudioSession> | undefined;
}

function getSessionMap(): Map<string, StudioSession> {
  if (!globalThis.__nova_studio_sessions__) {
    globalThis.__nova_studio_sessions__ = new Map();
  }
  return globalThis.__nova_studio_sessions__;
}

export function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.close(() => resolve(true));
      })
      .listen(port, '127.0.0.1');
  });
}

export async function findAvailablePort(startPort = 3050, maxPort = 3099): Promise<number> {
  for (let p = startPort; p <= maxPort; p++) {
    if (await isPortAvailable(p)) {
      return p;
    }
  }
  throw new Error(`No available ports found between ${startPort} and ${maxPort}`);
}

export function checkHttpAlive(url: string, timeoutMs = 1500): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const req = http.get(url, { timeout: timeoutMs }, (res) => {
        resolve(res.statusCode === 200 || res.statusCode === 304);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

export async function startStudio(job: { id: string; slug: string; project_dir: string }): Promise<{
  success: boolean;
  url: string;
  port: number;
  alreadyRunning?: boolean;
}> {
  const sessions = getSessionMap();
  const existing = sessions.get(job.id);

  if (existing) {
    const isAlive = await checkHttpAlive(`http://127.0.0.1:${existing.port}/`);
    if (isAlive) {
      return {
        success: true,
        url: existing.url,
        port: existing.port,
        alreadyRunning: true,
      };
    }
    sessions.delete(job.id);
  }

  const port = await findAvailablePort(3050);
  const studioUrl = `http://localhost:${port}/#project/${job.slug}`;

  const child = spawn('cmd.exe', ['/c', 'npx', 'hyperframes@0.8.46', 'preview', '.', '--port', String(port), '--no-open'], {
    cwd: job.project_dir,
    stdio: 'pipe',
    windowsHide: true,
  });

  const session: StudioSession = {
    jobId: job.id,
    slug: job.slug,
    projectDir: job.project_dir,
    port,
    pid: child.pid,
    url: studioUrl,
    startedAt: new Date().toISOString(),
  };
  sessions.set(job.id, session);

  const startTime = Date.now();
  const maxWaitMs = 20000;
  let isReady = false;

  while (Date.now() - startTime < maxWaitMs) {
    await new Promise((r) => setTimeout(r, 600));
    isReady = await checkHttpAlive(`http://127.0.0.1:${port}/`);
    if (isReady) break;
  }

  if (!isReady) {
    if (child.pid) {
      try {
        spawn('taskkill', ['/PID', child.pid.toString(), '/T', '/F'], { shell: true });
      } catch {}
    }
    sessions.delete(job.id);
    throw new Error('HyperFrames Studio preview server failed to start within timeout');
  }

  return {
    success: true,
    url: studioUrl,
    port,
  };
}

export async function stopStudio(jobId: string, projectDir?: string): Promise<{ success: boolean }> {
  const sessions = getSessionMap();
  const session = sessions.get(jobId);

  if (session?.pid) {
    try {
      spawn('taskkill', ['/PID', session.pid.toString(), '/T', '/F'], { shell: true });
    } catch {}
  }

  const dir = projectDir || session?.projectDir;
  if (dir) {
    try {
      spawn('cmd.exe', ['/c', 'npx', 'hyperframes@0.8.46', 'preview', '.', '--stop'], {
        cwd: dir,
        windowsHide: true,
      });
    } catch {}
  }

  sessions.delete(jobId);
  return { success: true };
}

export async function getStudioStatus(jobId: string): Promise<{
  isRunning: boolean;
  url?: string;
  port?: number;
}> {
  const sessions = getSessionMap();
  const session = sessions.get(jobId);
  if (!session) return { isRunning: false };

  const isAlive = await checkHttpAlive(`http://127.0.0.1:${session.port}/`);
  if (!isAlive) {
    sessions.delete(jobId);
    return { isRunning: false };
  }

  return {
    isRunning: true,
    url: session.url,
    port: session.port,
  };
}
