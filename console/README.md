# Remotion Cloud Render Console

Public console:
https://remotion-render-console.remotion-console-7501243.workers.dev

## Current scope

- Cloudflare Worker frontend/API with D1 task and node registry.
- Password login with hashed credential stored in D1; agent token is stored as a hash.
- Task queue and task logs.
- Codespace agent polls for queued tasks and runs the verified `BenchmarkVideo` composition.
- The existing 4-core test result is preloaded into the task history.

## Codespace agent

Set these Codespaces user secrets, restricted to this repository:

The agent uses the Codespaces GitHub CLI authentication automatically. No extra agent token needs to be copied into the repository or environment.

Then start the Codespace. The devcontainer starts the agent in the background automatically. To run it manually from the repository root:

```bash
node console/agent.mjs
```

The agent reports heartbeats, claims queued jobs, streams progress/log messages, and records the output file path and render metrics.

## Current limitations

- Only `BenchmarkVideo` is enabled for remote task submission in this first phase.
- R2 is not enabled on the Cloudflare account yet, so completed MP4 files remain in the Codespace workspace and are not yet playable from the console. Enable R2 in the Cloudflare Dashboard to add durable artifact storage and browser playback.
- The Codespace must be running for its agent to claim queued jobs. The dashboard itself remains online independently.
- Production Remotion templates and the main video workbench are planned for phase 2.

## Office dispatcher

Run `node console/office-agent.mjs` on the authenticated office Windows PC. It uses the existing GitHub CLI login on that PC to authenticate with the console, polls the task queue, starts the selected Codespace over `gh codespace ssh`, pulls the latest repository code, and performs the Remotion render remotely. Keep the office PC dispatcher running when you want queued jobs to start automatically.
