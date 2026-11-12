import { spawn, execFileSync } from 'node:child_process';
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

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function post(endpoint, payload) {
  const response = await fetch(API + endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + GH_TOKEN },
    body: JSON.stringify(payload)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || ('HTTP ' + response.status));
  return body;
}
function getCodespaceState() {
  try {
    const raw = execFileSync('gh', ['codespace','list','--json','name,state'], {encoding:'utf8',stdio:['ignore','pipe','ignore']});
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
  const relativeOutput = 'out/console/' + id + '.mp4';
  const remoteCommand = 'cd ' + REMOTE_ROOT +
    ' && git pull --ff-only origin main' +
    ' && mkdir -p out/console' +
    ' && npx remotion render src/index.ts BenchmarkVideo ' + relativeOutput +
    ' --codec=h264 --concurrency=' + concurrency;
  const started = Date.now();
  let lastProgress = -1;
  let buffer = '';
  console.log('[office-agent] Rendering', id, 'on', CODESPACE, 'concurrency', concurrency);
  const progressHandler = chunk => {
    const text = chunk.toString();
    process.stdout.write(text);
    buffer += text.replace(/\r/g,'\n');
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const matches = [...line.matchAll(/(\d+(?:\.\d+)?)%/g)];
      if (matches.length) {
        const pct = Math.max(0,Math.min(99.9,Number(matches[matches.length-1][1])));
        if (pct - lastProgress >= 0.5) {
          lastProgress = pct;
          post('/api/agent/progress',{
            task_id:id,
            progress:pct,
            rendered_frames:Math.round((task.total_frames||1800)*pct/100),
            message:line.trim().slice(0,500)
          }).catch(error=>console.error('[office-agent] progress:',error.message));
        }
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
    const elapsed = Math.round((Date.now()-started)/1000*100)/100;
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
  console.log('[office-agent] Started; Codespace:',CODESPACE,'Node:',process.version,'Host:',os.hostname());
  while (true) {
    lastState = getCodespaceState();
    await heartbeat(activeTaskId ? 'online' : (lastState === 'Available' ? 'online' : 'offline'));
    try {
      const result = await post('/api/agent/claim',{node_id:NODE_ID});
      if (result.task) {
        activeTaskId = result.task.id;
        await heartbeat('online');
        try { await renderTask(result.task); }
        catch (error) { console.error('[office-agent] task failed:',error.message); }
        finally { activeTaskId=null; lastState=getCodespaceState(); await heartbeat(lastState==='Available'?'online':'offline'); }
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
