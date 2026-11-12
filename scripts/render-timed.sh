#!/usr/bin/env bash
set -euo pipefail
mkdir -p out reports
echo "Starting 60-second Remotion render..."
START=$(date +%s)
if command -v /usr/bin/time >/dev/null 2>&1; then
  /usr/bin/time -v npx remotion render src/index.ts BenchmarkVideo out/benchmark-60s.mp4 --codec=h264 --concurrency=4 2> reports/render-time.txt
else
  npx remotion render src/index.ts BenchmarkVideo out/benchmark-60s.mp4 --codec=h264 --concurrency=4
fi
END=$(date +%s)
ELAPSED=$((END-START))
SIZE=$(du -h out/benchmark-60s.mp4 | cut -f1)
node -e "const fs=require('fs'); const r={finishedAt:new Date().toISOString(),videoSeconds:60,renderWallSeconds:$ELAPSED,renderSpeedRatio:Number((60/$ELAPSED).toFixed(3)),output:'out/benchmark-60s.mp4',outputSize:'$SIZE',resolution:'1920x1080',fps:30,frames:1800,codec:'h264',concurrency:4}; fs.writeFileSync('reports/render-report.json',JSON.stringify(r,null,2)); console.log(JSON.stringify(r,null,2));"
