# Dual-Agent Control Repository Template

This repository is a reusable control repository template for dual-agent software projects.

It keeps project planning, loop instructions, Codex execution reports, GPT Agent reviews, and project evolution history outside the business repository. The business repository stays focused on source code and product-facing documentation. The control repository acts as the shared long-term context between the human, Codex, and the GPT Agent.

The control repository is not a job queue. It is the durable project brain and history log.

## Core Roles

- Human: sets direction, approves important scope changes, and resolves product or business decisions.
- Codex: executes the current loop against the business repository and writes an execution report.
- GPT Agent: reviews Codex output, records review decisions, writes the next loop, and updates the current state pointer.
- Control repository: stores durable project context, loop history, reports, reviews, and decisions.
- Business repository: stores application source code, tests, and product-facing documentation.

n8n is optional. `signals/` and `locks/` are not required for the MVP.

## Basic Lifecycle

1. Initialize project documents in `project/`.
2. Create the first loop document under `loops/`.
3. Update `state/current.md` to point to the current loop.
4. Codex reads `state/current.md` and executes the current loop against the business repository.
5. Codex writes `reports/codex/<loop_id>-codex-report.md`.
6. Codex sends a review request to the GPT Agent through the available browser or agent channel.
7. The GPT Agent reviews the business repository changes and writes `reviews/gpt-agent/<loop_id>-gpt-review.md`.
8. The GPT Agent writes the next loop under `loops/` and updates `state/current.md`.
9. Codex continues with the next loop.

## Quick Start

```bash
git clone https://github.com/Gengetau/agent-loop-control-template.git
cd agent-loop-control-template
cp config/project.example.json config/project.json
npm run show:state
npm run validate:loop
```

After creating a new project from this template, replace placeholders such as `OWNER/BUSINESS_REPO`, `OWNER/CONTROL_REPO`, and `Example Project`.

## Recommended Setup

1. Fill out `project/vision.md`, `project/requirements.md`, `project/architecture.md`, and `project/decisions.md`.
2. Copy `templates/loop.md` into `loops/<loop_id>.md` for the first real loop.
3. Update `state/current.md` so `current_loop` points to that loop.
4. Ask Codex to execute the current loop.
5. Ask the GPT Agent to review the Codex report and write the next loop.

## Main Directories

- `project/`: durable product and architecture context.
- `loops/`: loop documents that describe Codex execution tasks.
- `reports/codex/`: Codex execution reports.
- `reviews/gpt-agent/`: GPT Agent review artifacts.
- `state/current.md`: human-readable pointer to the current loop and recent artifacts.
- `docs/`: protocol and agent guides.
- `templates/`: copyable templates for loops, reports, reviews, state, and project documents.
- `examples/`: examples that show the expected artifact shape.

## Status Values

`state/current.md` should use one of these simple status values:

- `ready-for-codex`
- `codex-running`
- `ready-for-gpt-review`
- `changes-requested`
- `done`
- `blocked`

## Validation

The scripts are dependency-free:

```bash
npm run show:state
npm run validate:loop
node scripts/validate-loop.mjs loops/loop-001-example.md
```

These scripts are intentionally small. They help humans and agents catch obvious template mistakes without turning the control repository into a full automation platform.
