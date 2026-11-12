import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
const report = {
  capturedAt: new Date().toISOString(),
  platform: process.platform,
  architecture: process.arch,
  node: process.version,
  cpuCount: os.cpus().length,
  cpuModel: os.cpus()[0]?.model ?? 'unknown',
  totalMemoryGiB: Number((os.totalmem() / 1024 ** 3).toFixed(2)),
  freeMemoryGiB: Number((os.freemem() / 1024 ** 3).toFixed(2)),
  note: 'Codespaces machine SKU and Core Hours should also be recorded from GitHub UI.'
};
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync(path.join('reports', 'machine-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
