import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = process.env.REMOTION_REPO_ROOT || process.cwd();
const port = Number(process.env.RENDER_ARTIFACT_PORT || 4174);
const artifacts = path.resolve(root, 'out', 'console');

http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, {'content-type':'text/plain'}).end('Method not allowed');
    return;
  }
  const match = new URL(req.url || '/', 'http://localhost').pathname.match(/^\/artifacts\/([a-f0-9-]{36})\.mp4$/i);
  if (!match) {
    res.writeHead(404, {'content-type':'text/plain','cache-control':'no-store'}).end('Not found');
    return;
  }
  const file = path.resolve(artifacts, match[1] + '.mp4');
  if (!file.startsWith(artifacts + path.sep) || !fs.existsSync(file)) {
    res.writeHead(404, {'content-type':'text/plain','cache-control':'no-store'}).end('Artifact not found');
    return;
  }
  const stat = fs.statSync(file);
  const range = req.headers.range;
  const headers = {
    'content-type':'video/mp4',
    'accept-ranges':'bytes',
    'cache-control':'private, max-age=60',
    'content-length':stat.size
  };
  if (range) {
    const parts = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!parts) {
      res.writeHead(416, {'content-range':'bytes */' + stat.size}).end();
      return;
    }
    const start = parts[1] ? Number(parts[1]) : 0;
    const end = parts[2] ? Math.min(Number(parts[2]),stat.size-1) : stat.size-1;
    if (start > end || start >= stat.size) {
      res.writeHead(416, {'content-range':'bytes */' + stat.size}).end();
      return;
    }
    headers['content-range'] = 'bytes ' + start + '-' + end + '/' + stat.size;
    headers['content-length'] = end - start + 1;
    res.writeHead(206, headers);
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file,{start,end}).pipe(res);
    return;
  }
  res.writeHead(200,headers);
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}).listen(port,'0.0.0.0',()=>console.log('[artifact-server] listening on',port,'serving task MP4s only'));
