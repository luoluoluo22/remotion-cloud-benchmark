# 4-core GitHub Codespaces test — 2026-11-12

## Environment

- Repository: `luoluoluo22/remotion-cloud-benchmark`
- Codespace: `4-core-ssh-benchmark-wvgg7x9pr56f9vxw`
- Region: Southeast Asia
- Machine: `standardLinux32gb`
- Provisioned specification: 4 cores, 16 GB RAM, 32 GB storage
- Dev container: Debian Bookworm, Node 22
- SSH access: verified after adding the Dev Container `sshd` feature
- Chromium runtime: installed `libnspr4` and `libnss3`

## Full render result

- Composition: `BenchmarkVideo`
- Duration: 60 seconds
- Resolution: 1920×1080
- Frame rate: 30 FPS
- Frames: 1,800
- Codec: H.264
- Remotion concurrency: 4
- Wall time: 93 seconds
- Render speed ratio: 0.645× real time
- Output: `out/benchmark-60s.mp4`
- Output size: 3.6 MB
- Result: completed successfully; exit code 0

## Reproducibility fixes

The repository's `.devcontainer/devcontainer.json` now enables:

- `ghcr.io/devcontainers/features/sshd:1`
- `libnspr4` and `libnss3` installation before `npm install`

This avoids the two setup failures encountered during the first connection/render attempt.

## Notes

The original Codespace `redesigned-halibut-vpqqvwg9vqv3x7wj` was left untouched because its GitHub API record showed uncommitted and unpushed workspace changes. Testing was performed in a separate 4-core Codespace.

A repeated three-run Remotion benchmark was attempted, but the CLI progress stream did not provide a complete summary table. It is not included in the measured result above and should be rerun before drawing conclusions about run-to-run variance.
