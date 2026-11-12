import { spawn, execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const API = (process.env.RENDER_CONSOLE_URL || 'https://remotion-render-console.remotion-console-7501243.workers.dev').replace(/\/$/, '');
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || (() => { try { return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; } })();
const ROOT = process.env.REMOTION_REPO_ROOT || process.cwd();
const NODE_ID = process.env.RENDER_NODE_ID || 'codespace-4-core';
const MACHINE = process.env.RENDER_MACHINE_TYPE || 'standardLinux32gb';
const REGION = process.env.RENDER_REGION || 'Southeast Asia';
const VERSION = '1.0.0';

if (!TOKEN) {
  console.error('[render-agent] No GitHub Codespaces authentication token found; run gh auth login or check Codespaces GitHub CLI auth.');
  process.exit(2);
}
if (!fs.existsSync(path.join(ROOT, 'package.json'))) {
  console.error('[render-agent] Run this agent from the remotion-cloud-benchmark repository root.');
  process.exit(2);
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function post(endpoint, payload) {
  const response = await fetch(API + endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + TOKEN },
    body: JSON.stringify(payload)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || ('HTTP ' + response.status));
  return body;
}

const totalMemoryGb = Math.round(os.totalmem() / (1024 ** 3) * 100) / 100;
let activeTaskId = null;
async function heartbeat() {
  try {
    await post('/api/agent/heartbeat', {
      node_id: NODE_ID,
      label: '4 核 GitHub Codespace',
      machine_type: MACHINE,
      cpu_cores: os.cpus().length,
      memory_gb: totalMemoryGb,
      storage_gb: 32,
      region: REGION,
      current_task_id: activeTaskId,
      agent_version: VERSION
    });
  } catch (error) {
    console.error('[render-agent] heartbeat:', error.message);
  }
}

async function render(task) {
  const outputDir = path.join(ROOT, 'out', 'console');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputFile = path.join(outputDir, task.id + '.mp4');
  const started = Date.now();
  let lastProgress = -1;
  let pending = '';
  console.log('[render-agent] Start', task.id, task.composition, 'concurrency=' + task.concurrency);

  const args = [
    'remotion', 'render', 'src/index.ts', task.composition, outputFile,
    '--codec=' + task.codec, '--concurrency=' + task.concurrency
  ];
  const child = spawn('npx', args, { cwd: ROOT, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });

  const processChunk = chunk => {
    const text = chunk.toString();
    process.stdout.write(text);
    pending += text.replace(/\r/g, '\n');
    const lines = pending.split('\n');
    pending = lines.pop() || '';
    for (const line of lines) {
      const matches = [...line.matchAll(/(\d+(?:\.\d+)?)%/g)];
      if (matches.length) {
        const pct = Math.max(0, Math.min(99.9, Number(matches[matches.length - 1][1])));
        if (pct - lastProgress >= 0.5 || pct === 99.9) {
          lastProgress = pct;
          post('/api/agent/progress', {
            task_id: task.id,
            progress: pct,
            rendered_frames: Math.round((task.total_frames || 1800) * pct / 100),
            message: line.trim().slice(0, 500)
          }).catch(error => console.error('[render-agent] progress:', error.message));
        }
      } else if (line.trim() && /error|warning|rendering|browser|encoding/i.test(line)) {
        post('/api/agent/progress', { task_id: task.id, progress: Math.max(0,lastProgress), rendered_frames: Math.round((task.total_frames || 1800) * Math.max(0,lastProgress) / 100), message: line.trim().slice(0, 500) }).catch(() => {});
      }
    }
  };
  child.stdout.on('data', processChunk);
  child.stderr.on('data', processChunk);

  const heartbeatTimer = setInterval(() => heartbeat(), 20000);
  const exitCode = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', resolve);
  });
  clearInterval(heartbeatTimer);

  const elapsedSeconds = Math.round((Date.now() - started) / 1000 * 100) / 100;
  if (exitCode !== 0) {
    const message = 'Remotion exited with code ' + exitCode;
    await post('/api/agent/fail', { task_id: task.id, error: message });
    throw new Error(message);
  }
  if (!fs.existsSync(outputFile)) {
    const message = 'Render exited successfully but output MP4 was not found: ' + outputFile;
    await post('/api/agent/fail', { task_id: task.id, error: message });
    throw new Error(message);
  }
  const size = fs.statSync(outputFile).size;
  const speedRatio = task.duration_sec ? Math.round(task.duration_sec / elapsedSeconds * 1000) / 1000 : null;
  await post('/api/agent/complete', {
    task_id: task.id,
    output_path: path.relative(ROOT, outputFile).replace(/\\/g, '/'),
    output_size: size,
    benchmark_seconds: elapsedSeconds,
    benchmark_speed_ratio: speedRatio
  });
  console.log('[render-agent] Completed', task.id, elapsedSeconds + 's', size + ' bytes');
}

async function main() {
  console.log('[render-agent] Connected to', API, 'as', NODE_ID, 'CPU', os.cpus().length, 'RAM', totalMemoryGb + 'GB');
  while (true) {
    await heartbeat();
    try {
      const result = await post('/api/agent/claim', { node_id: NODE_ID });
      if (result.task) {
        activeTaskId = result.task.id;
        await heartbeat();
        try {
          await render(result.task);
        } catch (error) {
          console.error('[render-agent] task failed:', error.message);
        } finally {
          activeTaskId = null;
          await heartbeat();
        }
      } else {
        await sleep(5000);
      }
    } catch (error) {
      console.error('[render-agent] poll failed:', error.message);
      await sleep(10000);
    }
  }
}

main().catch(error => {
  console.error('[render-agent] fatal:', error);
  process.exit(1);
});
