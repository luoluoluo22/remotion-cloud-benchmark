import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';

const PORT = Number(process.env.REMOTION_MEDIA_PORT || 8791);
const CACHE_DIR = path.join(process.env.LOCALAPPDATA || os.homedir(),'RemotionCloudRender','media-cache');
const AGENT_TOKEN_PATH = path.join(os.homedir(),'.remotion-cloud-agent-token');

function expectedAuthorization() {
  try {
    const token = fs.readFileSync(AGENT_TOKEN_PATH,'utf8').trim();
    if (!token) return null;
    return 'Bearer ' + createHash('sha256').update(token).digest('hex');
  } catch {
    return null;
  }
}

function sendJson(res,status,body) {
  const data = Buffer.from(JSON.stringify(body));
  res.writeHead(status,{'content-type':'application/json; charset=utf-8','content-length':data.length,'cache-control':'no-store'});
  res.end(data);
}

const server = http.createServer((req,res) => {
  const url = new URL(req.url || '/','http://127.0.0.1');
  if (url.pathname === '/health' && req.method === 'GET') {
    return sendJson(res,200,{ok:true,service:'remotion-media-gateway',cacheDir:CACHE_DIR});
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res,405,{error:'method not allowed'});
  const match = url.pathname.match(/^\/media\/([a-f0-9-]{36})\.mp4$/i);
  if (!match) return sendJson(res,404,{error:'not found'});
  const expected = expectedAuthorization();
  if (!expected || req.headers.authorization !== expected) return sendJson(res,401,{error:'unauthorized'});
  const id = match[1].toLowerCase();
  const file = path.join(CACHE_DIR,id + '.mp4');
  let stat;
  try { stat = fs.statSync(file); } catch { return sendJson(res,404,{error:'media not found'}); }
  if (!stat.isFile()) return sendJson(res,404,{error:'media not found'});

  let start = 0;
  let end = stat.size - 1;
  let status = 200;
  const range = req.headers.range;
  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!m) {
      res.writeHead(416,{'content-range':'bytes */'+stat.size,'accept-ranges':'bytes'});
      return res.end();
    }
    if (m[1] === '') {
      const suffix = Number(m[2]);
      if (!Number.isFinite(suffix) || suffix <= 0) {
        res.writeHead(416,{'content-range':'bytes */'+stat.size});
        return res.end();
      }
      start = Math.max(0,stat.size-suffix);
    } else {
      start = Number(m[1]);
      if (m[2] !== '') end = Math.min(end,Number(m[2]));
    }
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= stat.size) {
      res.writeHead(416,{'content-range':'bytes */'+stat.size,'accept-ranges':'bytes'});
      return res.end();
    }
    status = 206;
  }
  const headers = {
    'content-type':'video/mp4',
    'content-length':String(end-start+1),
    'accept-ranges':'bytes',
    'cache-control':'private, no-store',
    'content-disposition':'inline; filename="remotion-'+id+'.mp4"',
    'x-content-type-options':'nosniff'
  };
  if (status === 206) headers['content-range'] = 'bytes '+start+'-'+end+'/'+stat.size;
  res.writeHead(status,headers);
  if (req.method === 'HEAD') return res.end();
  const stream = fs.createReadStream(file,{start,end});
  stream.on('error',error=>{ if (!res.headersSent) sendJson(res,500,{error:'read failed'}); else res.destroy(error); });
  stream.pipe(res);
});

server.listen(PORT,'127.0.0.1',()=>console.log('[media-gateway] listening on 127.0.0.1:'+PORT+' cache='+CACHE_DIR));
server.on('error',error=>{console.error('[media-gateway] fatal:',error);process.exit(1);});
