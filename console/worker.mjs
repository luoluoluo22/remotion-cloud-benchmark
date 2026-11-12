
const PAGE = String.raw`<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Remotion Cloud · 渲染控制台</title>
<style>
:root{color-scheme:dark;--bg:#0b1020;--panel:#121a2d;--panel2:#18233a;--line:#26334d;--muted:#91a0ba;--text:#eef3ff;--blue:#76a9ff;--green:#42d392;--amber:#f6bd60;--red:#ff7777}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at 15% 0%,#172a4d 0,transparent 38%),var(--bg);color:var(--text);font:14px/1.5 Inter,ui-sans-serif,system-ui,"Microsoft YaHei",sans-serif}
button,input,select{font:inherit}button{cursor:pointer;border:1px solid var(--line);background:#1b2943;color:var(--text);border-radius:10px;padding:9px 13px}button.primary{background:#3268c8;border-color:#4e83e2}button:disabled{opacity:.45;cursor:not-allowed}
#login{min-height:100vh;display:grid;place-items:center;padding:20px}.login-card{width:min(420px,100%);padding:30px;background:var(--panel);border:1px solid var(--line);border-radius:22px;box-shadow:0 25px 80px #0007}.brand{font-weight:800;font-size:21px;letter-spacing:.2px}.sub{color:var(--muted);margin:5px 0 22px}.field{display:grid;gap:7px;margin:14px 0}.field label{color:var(--muted);font-size:12px}.field input,.field select{width:100%;background:#0b1324;border:1px solid var(--line);color:var(--text);border-radius:10px;padding:11px}
#app{display:none;min-height:100vh}.topbar{height:68px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 24px;background:#0b1020d9;position:sticky;top:0;z-index:5;backdrop-filter:blur(14px)}.brandline{display:flex;align-items:center;gap:12px}.logo{width:34px;height:34px;border-radius:11px;background:linear-gradient(135deg,#5595ff,#7b6bff);display:grid;place-items:center;font-weight:900}.top-actions{display:flex;align-items:center;gap:10px}.pill{font-size:11px;border:1px solid var(--line);border-radius:999px;padding:4px 9px;color:var(--muted)}.layout{display:grid;grid-template-columns:210px 1fr;max-width:1500px;margin:auto}.sidebar{padding:24px 14px;border-right:1px solid var(--line);min-height:calc(100vh - 68px)}.nav{display:flex;gap:11px;align-items:center;padding:11px 12px;border-radius:10px;color:var(--muted);margin:4px 0}.nav.active{background:#20385f;color:#fff}.main{padding:28px;min-width:0}.heading{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:22px}.heading h1{font-size:24px;margin:0 0 5px}.muted{color:var(--muted)}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:18px}.card{background:linear-gradient(180deg,#151f34,#11192a);border:1px solid var(--line);border-radius:16px;padding:17px;min-width:0}.stat-label{font-size:12px;color:var(--muted)}.stat-value{font-size:28px;font-weight:750;margin-top:8px}.grid2{display:grid;grid-template-columns:1.2fr .8fr;gap:14px;margin-bottom:18px}.card-title{font-size:14px;font-weight:700;margin:0 0 14px;display:flex;justify-content:space-between;align-items:center}.node{display:flex;align-items:center;gap:12px}.node-icon{width:42px;height:42px;border-radius:12px;background:#20385f;display:grid;place-items:center;font-size:20px}.node-meta{flex:1;min-width:0}.node-name{font-weight:700}.dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--amber);margin-right:6px}.dot.online{background:var(--green)}.node-specs{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.spec{font-size:11px;color:#c6d2e8;background:#1c2941;padding:5px 8px;border-radius:8px}.task-list{display:grid;gap:10px}.task{border:1px solid var(--line);background:#111a2b;border-radius:13px;padding:14px}.task-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.task-title{font-weight:700}.task-meta{font-size:11px;color:var(--muted);margin-top:4px}.status{font-size:11px;border-radius:999px;padding:4px 8px;white-space:nowrap;background:#28344b;color:#c8d4e9}.status.completed{background:#123d34;color:#69e0b0}.status.rendering{background:#17385d;color:#8dbdff}.status.failed{background:#4b2028;color:#ff9a9a}.status.queued{background:#49391c;color:#f6ce80}.progress{height:6px;background:#26334a;border-radius:99px;overflow:hidden;margin:12px 0 6px}.progress>span{display:block;height:100%;background:linear-gradient(90deg,#5797ff,#42d392);border-radius:99px}.task-bottom{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:11px;color:var(--muted)}.task-actions{display:flex;gap:7px}.task-actions button{font-size:11px;padding:5px 8px}.empty{padding:28px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:12px}.warning{background:#382d1a;border:1px solid #6b5325;color:#f4d394;padding:12px 14px;border-radius:12px;margin-bottom:16px;font-size:12px}.good{color:var(--green)}.table-wrap{overflow:auto}.modal{border:1px solid var(--line);border-radius:18px;background:var(--panel);color:var(--text);width:min(650px,calc(100% - 24px));padding:22px}.modal::backdrop{background:#030712bb;backdrop-filter:blur(4px)}.modal h2{margin:0 0 15px}.modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}.log-list{max-height:360px;overflow:auto;background:#090f1c;border-radius:10px;padding:12px;font:12px/1.7 ui-monospace,monospace;color:#b8c8e3;white-space:pre-wrap}.footer{font-size:11px;color:var(--muted);margin-top:20px}
@media(max-width:900px){.layout{grid-template-columns:1fr}.sidebar{display:flex;overflow:auto;min-height:0;padding:8px 12px;border-right:0;border-bottom:1px solid var(--line)}.nav{white-space:nowrap;margin:0}.main{padding:18px}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.grid2{grid-template-columns:1fr}}
@media(max-width:520px){.topbar{padding:0 14px}.topbar .pill{display:none}.main{padding:14px}.heading{align-items:center}.heading h1{font-size:20px}.stats{gap:9px}.card{padding:13px}.stat-value{font-size:24px}.modal-grid{grid-template-columns:1fr}.task-bottom{align-items:flex-start;flex-direction:column}}
</style>
</head>
<body>
<section id="login"><div class="login-card"><div class="brand">◈ Remotion Cloud</div><div class="sub">云端渲染控制台 · 安全登录</div><form id="loginForm"><div class="field"><label>控制台访问密码</label><input id="password" type="password" autocomplete="current-password" required placeholder="输入控制台密码"></div><button class="primary" style="width:100%" type="submit">登录控制台</button><div id="loginError" class="muted" style="margin-top:12px;font-size:12px"></div></form></div></section>
<section id="app">
<header class="topbar"><div class="brandline"><div class="logo">R</div><div><div class="brand">Remotion Cloud</div><div class="muted" style="font-size:11px">渲染控制台</div></div><span class="pill">PRIVATE WORKSPACE</span></div><div class="top-actions"><span class="pill" id="refreshLabel">自动刷新 · 5 秒</span><button id="logoutBtn">退出</button></div></header>
<div class="layout">
<aside class="sidebar"><div class="nav active">▦　总览</div><div class="nav">☷　渲染任务</div><div class="nav">▣　成片库</div><div class="nav">▤　渲染节点</div><div class="nav">◷　性能测试</div></aside>
<main class="main">
<div class="heading"><div><h1>渲染总览</h1><div class="muted">集中管理云端渲染任务、节点状态和输出结果</div></div><button class="primary" id="newTaskBtn">＋ 新建渲染</button></div>
<div id="agentWarning" class="warning">正在等待渲染代理连接。任务可以先加入队列，节点上线后自动领取。</div>
<div class="stats">
<div class="card"><div class="stat-label">累计任务</div><div class="stat-value" id="sTotal">—</div></div>
<div class="card"><div class="stat-label">排队中</div><div class="stat-value" id="sQueued">—</div></div>
<div class="card"><div class="stat-label">渲染中</div><div class="stat-value" id="sRendering">—</div></div>
<div class="card"><div class="stat-label">已完成</div><div class="stat-value" id="sCompleted">—</div></div>
</div>
<div class="grid2">
<div class="card"><div class="card-title">渲染节点 <span class="muted" style="font-size:11px">NODE STATUS</span></div><div id="nodes"><div class="muted">正在读取节点…</div></div></div>
<div class="card"><div class="card-title">最近一次基准测试 <span class="muted" style="font-size:11px">BENCHMARK</span></div><div style="display:flex;align-items:flex-end;gap:8px"><div class="stat-value" style="font-size:32px;margin:0">93s</div><div class="muted" style="padding-bottom:5px">60 秒视频渲染耗时</div></div><div class="node-specs"><span class="spec">4 vCPU</span><span class="spec">16 GB RAM</span><span class="spec">H.264</span><span class="spec">Concurrency 4</span></div><div class="muted" style="font-size:11px;margin-top:12px">1920×1080 · 30 FPS · 1,800 帧 · 3.6 MB</div></div>
</div>
<div class="card"><div class="card-title">渲染任务 <span class="muted" style="font-size:11px">LATEST 50</span></div><div id="tasks" class="task-list"><div class="muted">正在读取任务…</div></div></div>
<div class="footer">控制台 API 与任务数据库运行于 Cloudflare；Remotion 渲染由独立 Linux 节点执行。当前版本先开放 BenchmarkVideo 基准任务。</div>
</main></div></section>
<dialog id="createDialog" class="modal"><h2>新建渲染任务</h2><form id="createForm"><div class="field"><label>渲染项目</label><input value="luoluoluo22/remotion-cloud-benchmark" disabled></div><div class="field"><label>Composition</label><select id="composition"><option value="BenchmarkVideo">BenchmarkVideo · 60 秒基准视频</option></select></div><div class="modal-grid"><div class="field"><label>渲染并发</label><select id="concurrency"><option value="1">1 核并发</option><option value="2">2 核并发</option><option value="4" selected>4 核并发</option></select></div><div class="field"><label>编码格式</label><select id="codec"><option value="h264">H.264</option></select></div></div><div class="muted" style="font-size:12px">任务将进入队列，由在线渲染节点自动领取。当前仅开放已验证的 BenchmarkVideo，生产模板接入将在下一阶段完成。</div><div class="modal-actions"><button type="button" id="closeCreate">取消</button><button class="primary" type="submit">加入渲染队列</button></div></form></dialog>
<dialog id="detailDialog" class="modal"><h2 id="detailTitle">任务详情</h2><div id="detailBody"></div><h3 style="font-size:13px;margin:18px 0 8px">运行日志</h3><div id="detailLogs" class="log-list">暂无日志</div><div class="modal-actions"><button id="closeDetail">关闭</button></div></dialog>
<script>
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statusName=s=>({queued:'排队中',rendering:'渲染中',completed:'已完成',failed:'失败',cancelled:'已取消'}[s]||s);
async function api(path,options){const r=await fetch(path,Object.assign({credentials:'same-origin'},options||{}));const j=await r.json().catch(()=>({}));if(r.status===401){showLogin();throw new Error('登录已过期')}if(!r.ok)throw new Error(j.error||'请求失败');return j}
function showLogin(){$('app').style.display='none';$('login').style.display='grid'}
function showApp(){$('login').style.display='none';$('app').style.display='block'}
async function checkLogin(){try{const j=await api('/api/me');if(j.authenticated){showApp();await load()}else showLogin()}catch(e){showLogin()}}
async function login(e){e.preventDefault();$('loginError').textContent='';try{await api('/api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({password:$('password').value})});$('password').value='';showApp();await load()}catch(e){$('loginError').textContent=e.message}}
async function logout(){await api('/api/logout',{method:'POST'}).catch(()=>{});showLogin()}
function renderNode(n){const online=n.status==='online'&&n.last_seen&&Date.now()-Date.parse(n.last_seen)<90000;return '<div class="node"><div class="node-icon">▣</div><div class="node-meta"><div class="node-name">'+esc(n.label)+'</div><div class="muted" style="font-size:11px"><span class="dot '+(online?'online':'')+'"></span>'+(online?'在线':'离线 / 未连接')+' · '+esc(n.region||'区域待确认')+'</div></div><span class="pill">'+esc(n.machine_type||'Codespace')+'</span></div><div class="node-specs"><span class="spec">'+esc(n.cpu_cores||4)+' vCPU</span><span class="spec">'+esc(n.memory_gb||16)+' GB RAM</span><span class="spec">'+esc(n.storage_gb||32)+' GB SSD</span></div><div class="muted" style="font-size:11px;margin-top:10px">最近心跳：'+(n.last_seen?new Date(n.last_seen).toLocaleString():'尚未收到')+'</div>'}
function renderTask(t){const pct=Math.max(0,Math.min(100,Number(t.progress)||0));const output=t.output_url?'<button data-preview="'+esc(t.id)+'">预览成片</button>':(t.output_path?'<span>输出：'+esc(t.output_path)+'</span>':'<span>尚无输出文件</span>');return '<div class="task"><div class="task-top"><div><div class="task-title">'+esc(t.title)+'</div><div class="task-meta">'+esc(t.composition)+' · '+esc(t.width)+'×'+esc(t.height)+' · '+esc(t.fps)+' FPS · 并发 '+esc(t.concurrency)+'</div></div><span class="status '+esc(t.status)+'">'+esc(statusName(t.status))+'</span></div><div class="progress"><span style="width:'+pct+'%"></span></div><div class="task-bottom"><span>'+pct.toFixed(1)+'% · '+esc(t.rendered_frames||0)+' / '+esc(t.total_frames)+' 帧 · '+(t.created_at?new Date(t.created_at).toLocaleString():'')+'</span><div class="task-actions"><button data-detail="'+esc(t.id)+'">详情 / 日志</button>'+(t.status==='queued'?'<button data-cancel="'+esc(t.id)+'">取消</button>':'')+'</div></div><div class="task-bottom" style="margin-top:8px"><span>'+output+'</span><span>'+(t.benchmark_seconds?t.benchmark_seconds+' 秒':'')+'</span></div></div>'}
async function load(){try{const j=await api('/api/dashboard');const s=j.stats||{};$('sTotal').textContent=s.total||0;$('sQueued').textContent=s.queued||0;$('sRendering').textContent=s.rendering||0;$('sCompleted').textContent=s.completed||0;const nodes=j.nodes||[];$('nodes').innerHTML=nodes.length?nodes.map(renderNode).join(''):'<div class="empty">尚未登记渲染节点</div>';const online=nodes.some(n=>n.status==='online'&&n.last_seen&&Date.now()-Date.parse(n.last_seen)<90000);$('agentWarning').style.display=online?'none':'block';const tasks=j.tasks||[];$('tasks').innerHTML=tasks.length?tasks.map(renderTask).join(''):'<div class="empty">暂无渲染任务</div>';document.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>detail(b.dataset.detail));document.querySelectorAll('[data-cancel]').forEach(b=>b.onclick=()=>cancelTask(b.dataset.cancel));document.querySelectorAll('[data-preview]').forEach(b=>b.onclick=()=>preview(b.dataset.preview))}catch(e){console.error(e)}}
async function detail(id){try{const j=await api('/api/tasks/'+encodeURIComponent(id));$('detailTitle').textContent=j.task.title;$('detailBody').innerHTML='<div class="node-specs"><span class="spec">'+esc(j.task.status)+'</span><span class="spec">'+esc(j.task.width)+'×'+esc(j.task.height)+'</span><span class="spec">'+esc(j.task.concurrency)+' 并发</span></div><p class="muted" style="font-size:12px">任务 ID：'+esc(j.task.id)+'</p>'+(j.task.error?'<p style="color:var(--red)">'+esc(j.task.error)+'</p>':'')+(j.task.output_url?'<video controls playsinline style="width:100%;border-radius:12px" src="/media/'+esc(j.task.id)+'"></video>':(j.task.output_path?'<p class="muted">输出文件位于渲染节点：'+esc(j.task.output_path)+'</p>':''));$('detailLogs').textContent=(j.logs||[]).map(x=>'['+x.at+'] '+x.level.toUpperCase()+' '+x.message).join('\n')||'暂无日志';$('detailDialog').showModal()}catch(e){alert(e.message)}}
function preview(id){detail(id)}
async function cancelTask(id){if(!confirm('确定取消这个排队任务？'))return;try{await api('/api/tasks/'+encodeURIComponent(id)+'/cancel',{method:'POST'});await load()}catch(e){alert(e.message)}}
$('loginForm').addEventListener('submit',login);$('logoutBtn').addEventListener('click',logout);$('newTaskBtn').addEventListener('click',()=>$('createDialog').showModal());$('closeCreate').addEventListener('click',()=>$('createDialog').close());$('closeDetail').addEventListener('click',()=>$('detailDialog').close());$('createForm').addEventListener('submit',async e=>{e.preventDefault();try{await api('/api/tasks',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({composition:$('composition').value,concurrency:Number($('concurrency').value),codec:$('codec').value})});$('createDialog').close();await load()}catch(err){alert(err.message)}});checkLogin();setInterval(()=>{if($('app').style.display==='block')load()},5000);
</script></body></html>`;

const json = (data, status = 200) => new Response(JSON.stringify(data), {status, headers: {'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const now = () => new Date().toISOString();
const hash = async value => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(value)))), x=>x.toString(16).padStart(2,'0')).join('');
const randomToken = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), x=>x.toString(16).padStart(2,'0')).join('');
const validSession = async (request, env) => {
  const raw = (request.headers.get('cookie') || '').split(';').map(x=>x.trim()).find(x=>x.startsWith('render_session='));
  if (!raw) return false;
  const token = raw.slice('render_session='.length);
  if (!token) return false;
  const row = await env.DB.prepare("SELECT token_hash FROM console_sessions WHERE token_hash=? AND expires_at>?").bind(await hash(token), now()).first();
  return !!row;
};
const agentOk = async (request, env) => {
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) return false;
  const token = header.slice(7);
  if (token.length < 20) return false;
  const tokenHash = await hash(token);
  const cached = await env.DB.prepare("SELECT expires_at FROM agent_auth_cache WHERE token_hash=?").bind(tokenHash).first();
  if (cached && cached.expires_at > now()) return true;
  const response = await fetch('https://api.github.com/user', {
    headers: { authorization: 'Bearer ' + token, accept: 'application/vnd.github+json', 'user-agent': 'remotion-render-console' }
  });
  if (!response.ok) return false;
  const identity = await response.json();
  if (identity.login !== 'luoluoluo22') return false;
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await env.DB.prepare("INSERT INTO agent_auth_cache (token_hash,expires_at) VALUES (?,?) ON CONFLICT(token_hash) DO UPDATE SET expires_at=excluded.expires_at").bind(tokenHash,expires).run();
  return true;
};
const bodyJson = async request => { try { return await request.json(); } catch { return {}; } };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      if (path === '/api/health') return json({ok:true,service:'remotion-render-console',region:'APAC'});
      if (path === '/') return new Response(PAGE, {headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
      if (path === '/api/login' && request.method === 'POST') {
        const body = await bodyJson(request);
        const credential = await env.DB.prepare("SELECT value FROM console_secrets WHERE key='dashboard_password_hash'").first();
        if (!credential || (await hash(body.password || '')) !== credential.value) return json({error:'密码不正确'},401);
        const token = randomToken();
        const expires = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
        await env.DB.prepare("INSERT INTO console_sessions (token_hash,expires_at) VALUES (?,?)").bind(await hash(token),expires).run();
        return new Response(JSON.stringify({ok:true}), {headers:{'content-type':'application/json','cache-control':'no-store','set-cookie':'render_session='+token+'; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=43200'}});
      }
      if (path === '/api/logout' && request.method === 'POST') return new Response(JSON.stringify({ok:true}), {headers:{'content-type':'application/json','set-cookie':'render_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'}});
      if (path === '/api/me') return json({authenticated:await validSession(request,env)});
      if (path.startsWith('/api/agent/')) {
        if (!await agentOk(request,env)) return json({error:'agent unauthorized'},401);
        if (path === '/api/agent/heartbeat' && request.method === 'POST') {
          const b = await bodyJson(request);
          const nodeStatus = b.status === 'offline' ? 'offline' : 'online';
          await env.DB.prepare("INSERT INTO render_nodes (node_id,label,machine_type,cpu_cores,memory_gb,storage_gb,region,status,last_seen,current_task_id,agent_version) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(node_id) DO UPDATE SET label=excluded.label,machine_type=excluded.machine_type,cpu_cores=excluded.cpu_cores,memory_gb=excluded.memory_gb,storage_gb=excluded.storage_gb,region=excluded.region,status=excluded.status,last_seen=excluded.last_seen,current_task_id=excluded.current_task_id,agent_version=excluded.agent_version").bind(b.node_id,b.label,b.machine_type,b.cpu_cores,b.memory_gb,b.storage_gb,b.region,nodeStatus,now(),b.current_task_id||null,b.agent_version||'1.0').run();
          return json({ok:true});
        }
        if (path === '/api/agent/claim' && request.method === 'POST') {
          const b = await bodyJson(request);
          const task = await env.DB.prepare("UPDATE render_tasks SET status='rendering',node_id=?,started_at=?,progress=0 WHERE id=(SELECT id FROM render_tasks WHERE status='queued' ORDER BY created_at ASC LIMIT 1) RETURNING *").bind(b.node_id,now()).first();
          if (task) await env.DB.prepare("INSERT INTO render_logs (task_id,level,message) VALUES (?,'info',?)").bind(task.id,'任务已由节点 '+b.node_id+' 领取').run();
          return json({task:task||null});
        }
        if (path === '/api/agent/progress' && request.method === 'POST') {
          const b = await bodyJson(request);
          await env.DB.prepare("UPDATE render_tasks SET progress=?,rendered_frames=? WHERE id=? AND status='rendering'").bind(Math.max(0,Math.min(99.9,Number(b.progress)||0)),Math.max(0,Number(b.rendered_frames)||0),b.task_id).run();
          if (b.message) await env.DB.prepare("INSERT INTO render_logs (task_id,level,message) VALUES (?,'info',?)").bind(b.task_id,String(b.message).slice(0,1000)).run();
          return json({ok:true});
        }
        if (path === '/api/agent/complete' && request.method === 'POST') {
          const b = await bodyJson(request);
          let safeOutputUrl = null;
          if (b.output_url) {
            try {
              const candidate = new URL(b.output_url);
              if (candidate.protocol === 'https:' && candidate.hostname.endsWith('.app.github.dev')) safeOutputUrl = candidate.toString();
            } catch {}
          }
          await env.DB.prepare("UPDATE render_tasks SET status='completed',progress=100,rendered_frames=total_frames,finished_at=?,output_path=?,output_url=?,output_size=?,benchmark_seconds=?,benchmark_speed_ratio=? WHERE id=?").bind(now(),b.output_path||null,safeOutputUrl,b.output_size||null,b.benchmark_seconds||null,b.benchmark_speed_ratio||null,b.task_id).run();
          await env.DB.prepare("INSERT INTO render_logs (task_id,level,message) VALUES (?,'info',?)").bind(b.task_id,'渲染完成；输出文件 '+(b.output_path||'路径未提供')).run();
          return json({ok:true});
        }
        if (path === '/api/agent/fail' && request.method === 'POST') {
          const b = await bodyJson(request);
          await env.DB.prepare("UPDATE render_tasks SET status='failed',finished_at=?,error=? WHERE id=?").bind(now(),String(b.error||'unknown error').slice(0,2000),b.task_id).run();
          await env.DB.prepare("INSERT INTO render_logs (task_id,level,message) VALUES (?,'error',?)").bind(b.task_id,String(b.error||'渲染失败').slice(0,1000)).run();
          return json({ok:true});
        }
        return json({error:'not found'},404);
      }
      if (!await validSession(request,env)) return json({error:'请先登录'},401);
      const mediaMatch = path.match(/^\/media\/([a-f0-9-]+)$/i);
      if (mediaMatch && request.method === 'GET') {
        const task = await env.DB.prepare("SELECT output_url FROM render_tasks WHERE id=?").bind(mediaMatch[1]).first();
        if (!task || !task.output_url) return json({error:'视频文件尚未接入或渲染节点已离线'},404);
        const upstreamHeaders = new Headers();
        const range = request.headers.get('range');
        if (range) upstreamHeaders.set('range',range);
        const mediaUrl = new URL(task.output_url);
        if (mediaUrl.protocol !== 'https:' || !mediaUrl.hostname.endsWith('.app.github.dev')) return json({error:'视频地址不在允许的 Codespaces 域名内'},502);
        const upstream = await fetch(mediaUrl.toString(),{headers:upstreamHeaders});
        if (!upstream.ok && upstream.status !== 206) return json({error:'渲染节点暂时无法提供视频'},502);
        const headers = new Headers({'content-type':'video/mp4','accept-ranges':'bytes','cache-control':'private, no-store'});
        for (const key of ['content-length','content-range','last-modified','etag']) {
          const value = upstream.headers.get(key);
          if (value) headers.set(key,value);
        }
        return new Response(upstream.body,{status:upstream.status,headers});
      }
      if (path === '/api/dashboard') {
        const stats = await env.DB.prepare("SELECT COUNT(*) AS total,SUM(CASE WHEN status='queued' THEN 1 ELSE 0 END) AS queued,SUM(CASE WHEN status='rendering' THEN 1 ELSE 0 END) AS rendering,SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed,SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) AS failed FROM render_tasks").first();
        const tasks = await env.DB.prepare("SELECT * FROM render_tasks ORDER BY created_at DESC LIMIT 50").all();
        const nodes = await env.DB.prepare("SELECT * FROM render_nodes ORDER BY created_at DESC").all();
        return json({stats,tasks:tasks.results||[],nodes:nodes.results||[]});
      }
      if (path === '/api/tasks' && request.method === 'POST') {
        const b = await bodyJson(request);
        if (b.composition !== 'BenchmarkVideo') return json({error:'当前阶段仅支持 BenchmarkVideo'},400);
        const concurrency = Number(b.concurrency||4);
        if (![1,2,4].includes(concurrency)) return json({error:'并发数仅支持 1、2、4'},400);
        const id = crypto.randomUUID();
        const created = now();
        await env.DB.prepare("INSERT INTO render_tasks (id,title,repo,branch,composition,duration_sec,width,height,fps,codec,concurrency,status,progress,rendered_frames,total_frames,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,'queued',0,0,1800,?)").bind(id,'网页发起 · BenchmarkVideo','luoluoluo22/remotion-cloud-benchmark','main','BenchmarkVideo',60,1920,1080,30,'h264',concurrency,created).run();
        await env.DB.prepare("INSERT INTO render_logs (task_id,level,message) VALUES (?,'info','网页已创建渲染任务，等待节点领取')").bind(id).run();
        return json({ok:true,id});
      }
      const taskMatch = path.match(/^\/api\/tasks\/([a-f0-9-]+)(?:\/(cancel))?$/i);
      if (taskMatch && request.method === 'POST' && taskMatch[2] === 'cancel') {
        const result = await env.DB.prepare("UPDATE render_tasks SET status='cancelled',finished_at=? WHERE id=? AND status='queued'").bind(now(),taskMatch[1]).run();
        return json({ok:true,changes:result.meta?.changes||0});
      }
      if (taskMatch && request.method === 'GET') {
        const task = await env.DB.prepare("SELECT * FROM render_tasks WHERE id=?").bind(taskMatch[1]).first();
        if (!task) return json({error:'任务不存在'},404);
        const logs = await env.DB.prepare("SELECT * FROM render_logs WHERE task_id=? ORDER BY id ASC LIMIT 300").bind(taskMatch[1]).all();
        return json({task,logs:logs.results||[]});
      }
      return json({error:'not found'},404);
    } catch (error) {
      return json({error:'server error',detail:String(error?.message||error)},500);
    }
  }
};
