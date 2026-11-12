# Remotion Cloud Benchmark

A reproducible 60-second, 1080p30 Remotion render benchmark intended for GitHub Codespaces.

## Target environment

- GitHub Codespaces: 4-core Linux machine (select `standardLinux`)
- Output: 1920x1080, 30 fps, 60 seconds (1,800 frames)
- Codec: H.264
- Rendering: Chromium via Remotion; CPU-only baseline (no intentional WebGL effects)

## Start in Codespaces

1. Open the repository, choose **Code → Codespaces → Create codespace on main**.
2. Select the 4-core machine if prompted.
3. In the terminal:

```bash
npm install
npm run benchmark:machine
npm run render:timed
```

The MP4 is written to `out/benchmark-60s.mp4`. A machine and render report is written to `reports/`.

## Repeatable measurements

Run the benchmark with different concurrency settings:

```bash
npm run benchmark
```

Keep the same composition, codec, and run count when comparing machines.

## What to record

- Codespaces machine name / CPU count / RAM
- Render wall-clock time and speed ratio
- Output file size and peak memory
- Codespaces Core Hours consumed (from GitHub billing)

Repeat at least three times after the first warm-up render, and use the median.

## Important

Codespaces is a temporary development environment, not a persistent rendering server. Stop it when finished. Do not configure a payment method or spending budget just for this experiment unless you intentionally want paid usage.
