# Remotion Cloud Render Console

Public console: https://remotion-render-console.remotion-console-7501243.workers.dev

## Phase 1 capabilities

- Cloudflare Worker serves the responsive dashboard and authenticated API.
- Cloudflare D1 stores task history, render logs, node heartbeats, and hashed dashboard credentials.
- New benchmark tasks can be queued from the web UI for 10, 30, or 60 seconds.
- The office dispatcher claims tasks, starts the selected GitHub Codespace through GitHub CLI, pulls the latest code, and runs Remotion.
- Frame-based progress and render logs are reported back to the dashboard.
- The dashboard shows completed task metadata, output path, MP4 size, and Remotion command duration (including bundling and H.264 encoding, excluding SSH and repository sync).

## Login

The first-use dashboard password is supplied to the console owner in the ChatGPT conversation. The password itself is not stored in this repository; only its SHA-256 hash is stored in D1.

## Office dispatcher

Run on the authenticated office Windows PC:

```powershell
cd D:\Projects\remotion-cloud-benchmark
node console\office-agent.mjs
```

The office PC uses its existing GitHub CLI authentication once to bootstrap a dedicated render-agent token. The Worker verifies the GitHub account, stores only the token hash in D1, and the dispatcher stores the raw token in the current Windows user profile outside the repository. The GitHub CLI token is never committed or copied into Codespaces.

On the current office PC, Windows Task Scheduler has a task named `Remotion Cloud Render Agent` configured to start the dispatcher at user logon and restart it after failures. Logs are written to `logs/office-agent.log`.

## Current limitations

- Only `BenchmarkVideo` is enabled for web-submitted jobs. The production Remotion project and product-line templates are phase 2.
- The 10/30/60-second choices render the corresponding frame range of the 60-second benchmark composition.
- R2 is intentionally not enabled. Completed MP4 files are copied from Codespaces to the office PC local cache at `%LOCALAPPDATA%\\RemotionCloudRender\\media-cache`, then served through the existing free Cloudflare Tunnel at `https://render-media.xiangyi.cc.cd`. The Worker requires a dashboard session and adds the SHA-256 hash of the office agent token before proxying the video; the local gateway validates it. HTTP Range requests are supported for browser seeking. The office PC must remain online for playback and downloads. No object-storage subscription or R2 charges are used.
- The dashboard remains online independently, but a queued job starts only while the office dispatcher is running. The Codespace can be stopped between jobs; the dispatcher connects and starts it when a job is claimed.
- If the office PC is offline, tasks remain queued until the dispatcher returns.

## Cloud resources

- Worker: `remotion-render-console`
- D1 database: `remotion_render_console` (APAC primary location)
- Codespace: `4-core-ssh-benchmark-wvgg7x9pr56f9vxw` (`standardLinux32gb`, 4 vCPU, 16 GB RAM, 32 GB storage)


## Free media gateway

- Hostname: `render-media.xiangyi.cc.cd`
- Existing Cloudflare Tunnel: `raccoon-mcp-xiangyi` (existing routes preserved; media route appended)
- Local origin: `127.0.0.1:8791`
- Local cache: `%LOCALAPPDATA%\\RemotionCloudRender\\media-cache`
- Gateway script: `console/media-gateway.mjs`
- Office scheduled task: `Remotion Cloud Media Gateway`
- The gateway binds to loopback only and serves only UUID-named MP4 files.
- Browser requests pass through the authenticated Worker media endpoint; the Worker forwards the SHA-256 hash of the office agent token, which the local gateway verifies against the agent token stored in the Windows user profile.
