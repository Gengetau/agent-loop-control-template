# Optional n8n Automation

n8n is not required for the MVP dual-agent protocol.

The core workflow uses `state/current.md`, loop files, Codex reports, GPT Agent reviews, and project documents. Humans and agents can operate the loop directly through commits and review artifacts.

## Useful Later Additions

n8n can be added later for:

- Notifications when `state/current.md` changes.
- Dashboarding across multiple control repositories.
- Stuck-loop alerts when no report or review appears after an expected time window.
- Multi-project monitoring.
- Scheduled checks that remind a human or agent to continue a loop.

## Boundary

Optional automation should observe and assist the dual-agent loop. It should not make signal files, locks, or watched queues mandatory for a project to use this template.
