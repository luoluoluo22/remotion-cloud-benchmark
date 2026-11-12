# Remotion Cloud Console — Phase 1 report

Date: 2026-11-12

## Public console

- URL: https://remotion-render-console.remotion-console-7501243.workers.dev
- Cloudflare Worker: `remotion-render-console`
- D1 database: `remotion_render_console`
- D1 primary region hint: APAC
- Authentication: random first-use password; only SHA-256 hash stored in D1
- Dashboard APIs require a valid session cookie
- Agent API verifies the GitHub CLI token against GitHub identity `luoluoluo22`; only a hash is cached for ten minutes

## Render orchestration

- Office dispatcher: `console/office-agent.mjs`
- Office host: `CHINAMI-3IF988E`
- Current Codespace: `4-core-ssh-benchmark-wvgg7x9pr56f9vxw`
- Machine: `standardLinux32gb`, 4 vCPU, 16 GB RAM, 32 GB storage
- Region: Southeast Asia
- Office dispatcher runs as a Windows Scheduled Task named `Remotion Cloud Render Agent`, triggered at user logon and configured to restart on failure
- Task flow: web queue → office dispatcher → GitHub Codespaces SSH → Remotion render → D1 progress/log/result update

## Verified jobs

| Job | Frames | Duration | Render time | Output |
|---|---:|---:|---:|---:|
| 60-second end-to-end test | 1,800 | 60s | 144.32s total orchestration time | 3,718,356 bytes |
| 10-second short test | 300 | 10s | 19.21s Remotion command time | 766,071 bytes |
| 60-second full benchmark | 1,800 | 60s | 80.86s Remotion command time | 3,718,356 bytes |

The 144.32-second figure includes SSH startup, repository synchronization, and render setup. The new dispatcher measures the `npx remotion render` command interval separately; that interval includes Remotion bundling and H.264 encoding but excludes SSH startup and `git pull`. The verified 60-second command-time ratio is 0.742× real time. The short test verified frame-based progress from 0/300 through 300/300; the full test completed 1,800/1,800 frames successfully.

## Current product limits

- Web submission currently supports `BenchmarkVideo` only, with 10, 30, and 60-second frame ranges.
- Production Remotion templates and product-line selection are not connected yet.
- R2 is not enabled on the Cloudflare account. MP4 files remain in the private Codespace workspace; the dashboard currently shows the output path and size, but does not yet provide persistent browser playback or downloads.
- The console remains online if the office PC is off. Queued tasks wait until the office dispatcher is running.
