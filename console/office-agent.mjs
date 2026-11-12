import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const API = 'https://remotion-render-console.remotion-console-7501243.workers.dev';
const CODESPACE = process.env.REMOTION_CODESPACE || '4-core-ssh-benchmark-wvgg7x9pr56f9vxw';
const REMOTE_ROOT = '/workspaces/remotion-cloud-benchmark';
const NODE_ID = 'codespace-4-core';
const MACHINE = 'standardLinux32gb';
const REGION = 'Southeast Asia';
const LOCAL_ROOT = process.env.REMOTION_CONSOLE_REPO || 'D:\\Projects\\remotion-cloud-benchmark';
const GH_TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || execFileSync('gh', ['auth', 'token'], {encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
const TOKEN_PATH = path.join(os.homedir(), '.remotion-cloud-agent-token');
let AGENT_TOKEN = fs.existsSync(TOKEN_PATH) ? fs.readFileSync(TOKEN_PATH,'utf8').trim() : '';
async function ensureAgentToken(force = false) {
  if (AGENT_TOKEN && !force) return AGENT_TOKEN;
  const response = await fetch(API + '/api/agent/bootstrap', {
    method:'POST',
    headers:{authorization:'Bearer ' + GH_TOKEN},
    signal:AbortSignal.timeout(20000)
  });
  const body = await response.json().catch(()=>({}));
  if (!response.ok || !body.token) throw new Error(body.error || 'Render agent bootstrap failed');
  AGENT_TOKEN = body.token;
  fs.writeFileSync(TOKEN_PATH,AGENT_TOKEN,{encoding:'utf8',mode:0o600});
  return AGENT_TOKEN;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function post(endpoint, payload, retried = false) {
  await ensureAgentToken();
  const response = await fetch(API + endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + AGENT_TOKEN },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20000)
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401 && !retried) {
    await ensureAgentToken(true);
    return post(endpoint,payload,true);
  }
  if (!response.ok) throw new Error(body.error || ('HTTP ' + response.status));
  return body;
}
function getCodespaceState() {
  try {
    const raw = execFileSync('gh', ['codespace','list','--json','name,state'], {encoding:'utf8',stdio:['ignore','pipe','ignore'],timeout:30000});
    const rows = JSON.parse(raw);
    const found = rows.find(row => row.name === CODESPACE);
    return found ? found.state : 'NotFound';
  } catch (error) {
    console.error('[office-agent] cannot read Codespaces state:', error.message);
    return 'Unknown';
  }
}
function runRemote(command, onChunk) {
  return new Promise((resolve, reject) => {
    const child = spawn('gh', ['codespace','ssh','-c',CODESPACE,'--',command], {
      cwd: LOCAL_ROOT,
      windowsHide: true,
      stdio: ['ignore','pipe','pipe']
    });
    child.stdout.on('data', chunk => { if (onChunk) onChunk(chunk); else process.stdout.write(chunk); });
    child.stderr.on('data', chunk => { if (onChunk) onChunk(chunk); else process.stderr.write(chunk); });
    child.once('error', reject);
    child.once('close', code => code === 0 ? resolve() : reject(new Error('gh codespace ssh exited with code ' + code)));
  });
}
function remoteCapture(command) {
  return new Promise((resolve, reject) => {
    let output = '';
    const child = spawn('gh', ['codespace','ssh','-c',CODESPACE,'--',command], {
      cwd: LOCAL_ROOT,
      windowsHide: true,
      stdio: ['ignore','pipe','pipe']
    });
    child.stdout.on('data', chunk => output += chunk.toString());
    child.stderr.on('data', chunk => process.stderr.write(chunk));
    child.once('error', reject);
    child.once('close', code => code === 0 ? resolve(output.trim()) : reject(new Error('remote command exited with code ' + code)));
  });
}
let activeTaskId = null;
let lastState = 'Unknown';
let lastStateCheckedAt = 0;
function refreshCodespaceState(force = false) {
  if (force || Date.now() - lastStateCheckedAt > 30000) {
    lastState = getCodespaceState();
    lastStateCheckedAt = Date.now();
  }
  return lastState;
}
async function heartbeat(status) {
  try {
    await post('/api/agent/heartbeat', {
      node_id: NODE_ID,
      label: '4 核 GitHub Codespace',
      machine_type: MACHINE,
      cpu_cores: 4,
      memory_gb: 16,
      storage_gb: 32,
      region: REGION,
      status: status || (activeTaskId ? 'online' : (lastState === 'Available' ? 'online' : 'offline')),
      current_task_id: activeTaskId,
      agent_version: 'office-dispatcher-1.0'
    });
  } catch (error) {
    console.error('[office-agent] heartbeat:', error.message);
  }
}

async function renderTask(task) {
  if (task.composition !== 'BenchmarkVideo') throw new Error('Unsupported composition: ' + task.composition);
  const id = String(task.id).replace(/[^a-f0-9-]/gi, '');
  const concurrency = [1,2,4].includes(Number(task.concurrency)) ? Number(task.concurrency) : 4;
  const totalFrames = [300,900,1800].includes(Number(task.total_frames)) ? Number(task.total_frames) : 1800;
  const relativeOutput = 'out/console/' + id + '.mp4';
  const remoteCommand = 'set -e; cd ' + REMOTE_ROOT +
    '; git pull --ff-only origin main' +
    '; mkdir -p out/console' +
    '; start=$(date +%s%3N); set +e; npx remotion render src/index.ts BenchmarkVideo ' + relativeOutput +
    ' --codec=h264 --concurrency=' + concurrency + ' --frames=0-' + (totalFrames - 1) +
    '; render_exit=$?; set -e; end=$(date +%s%3N); echo __RENDER_ELAPSED_MS=$((end-start)); exit $render_exit';
  const started = Date.now();
  let lastProgress = -1;
  let lastLoggedProgress = -5;
  let buffer = '';
  let remoteRenderMs = null;
  console.log('[office-agent] Rendering', id, 'on', CODESPACE, 'concurrency', concurrency);
  const progressHandler = chunk => {
    const text = chunk.toString();
    process.stdout.write(text);
    buffer += text.replace(/\r/g,'\n');
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const elapsedMatch = line.match(/__RENDER_ELAPSED_MS=(\d+)/);
      if (elapsedMatch) remoteRenderMs = Number(elapsedMatch[1]);
      const frameMatch = line.match(/Rendered\s+(\d+)\/(\d+)/i);
      const renderPercent = line.match(/Rendering.*?(\d+(?:\.\d+)?)%/i);
      let pct = null;
      let frames = null;
      if (frameMatch) {
        frames = Number(frameMatch[1]);
        const total = Number(frameMatch[2]) || Number(task.total_frames) || 1800;
        pct = Math.max(0,Math.min(99.9,frames / total * 100));
      } else if (renderPercent) {
        pct = Math.max(0,Math.min(99.9,Number(renderPercent[1])));
        frames = Math.round((task.total_frames||1800)*pct/100);
      }
      if (pct !== null && pct - lastProgress >= 1) {
        lastProgress = pct;
        const payload = {
          task_id:id,
          progress:pct,
          rendered_frames:frames === null ? Math.round((task.total_frames||1800)*pct/100) : frames
        };
        if (pct - lastLoggedProgress >= 5) {
          payload.message = line.trim().slice(0,500);
          lastLoggedProgress = pct;
        }
        post('/api/agent/progress',payload).catch(error=>console.error('[office-agent] progress:',error.message));
      } else if (line.trim() && /error|warning|encoding/i.test(line)) {
        post('/api/agent/progress',{task_id:id,progress:Math.max(0,lastProgress),rendered_frames:Math.round((task.total_frames||1800)*Math.max(0,lastProgress)/100),message:line.trim().slice(0,500)}).catch(()=>{});
      }
    }
  };
  const timer = setInterval(() => heartbeat('online'),20000);
  try {
    await runRemote(remoteCommand, progressHandler);
    const sizeText = await remoteCapture('cd ' + REMOTE_ROOT + ' && stat -c %s ' + relativeOutput);
    const size = Number(sizeText.split(/\s+/).pop());
    const elapsed = remoteRenderMs ? Math.round(remoteRenderMs / 10) / 100 : Math.round((Date.now()-started)/1000*100)/100;
    await post('/api/agent/complete',{
      task_id:id,
      output_path:relativeOutput,
      output_size:Number.isFinite(size)?size:null,
      benchmark_seconds:elapsed,
      benchmark_speed_ratio:task.duration_sec?Math.round(task.duration_sec/elapsed*1000)/1000:null
    });
    console.log('[office-agent] Completed',id,elapsed+'s',size+' bytes');
  } catch (error) {
    await post('/api/agent/fail',{task_id:id,error:error.message}).catch(()=>{});
    throw error;
  } finally {
    clearInterval(timer);
  }
}

async function main() {
  await ensureAgentToken();
  console.log('[office-agent] Started; Codespace:',CODESPACE,'Node:',process.version,'Host:',os.hostname());
  while (true) {
    refreshCodespaceState();
    await heartbeat(activeTaskId ? 'online' : (lastState === 'Available' ? 'online' : 'offline'));
    try {
      const result = await post('/api/agent/claim',{node_id:NODE_ID});
      if (result.task) {
        activeTaskId = result.task.id;
        await heartbeat('online');
        try { await renderTask(result.task); }
        catch (error) { console.error('[office-agent] task failed:',error.message); }
        finally { activeTaskId=null; refreshCodespaceState(true); await heartbeat(lastState==='Available'?'online':'offline'); }
      } else {
        await sleep(5000);
      }
    } catch (error) {
      console.error('[office-agent] poll failed:',error.message);
      await sleep(10000);
    }
  }
}
main().catch(error=>{console.error('[office-agent] fatal:',error);process.exit(1);});
