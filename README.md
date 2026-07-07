# Agent Loop Control Template

This repository is a reusable control-plane template for agent-loop projects that coordinate GPT planning, Codex execution, n8n automation, human approval, and GitHub-based state.

The repository is intentionally separate from any business repository. It stores loop requests, execution reports, review artifacts, signals, locks, and lightweight state files so that automation can make progress through pull requests and commits without hiding the workflow inside one agent session.

## Roles

- GPT planning agent: turns a human request into a structured loop document with scope, acceptance criteria, and approval boundaries.
- Codex executor: discovers approved pending loops, performs the requested work, writes an execution report, and emits a waiting-review signal.
- GPT reviewer agent: reviews Codex output against the loop document, writes a review artifact, and emits a reviewed signal.
- n8n: watches repository directories, routes state changes, opens or updates GitHub issues or pull requests, and notifies humans when approval is required.
- GitHub: provides durable storage, audit history, branch isolation, pull requests, and a shared synchronization point for all actors.
- Human reviewer: approves high-risk loops, resolves ambiguous decisions, and accepts or rejects final results.

## Basic Lifecycle

1. A planner creates a loop document from `templates/loop.md`.
2. A human approves the loop when `human_approval_required` is true.
3. Automation moves the canonical loop file to `loops/pending/`.
4. Codex discovers the loop, creates the requested work branch, and executes the task.
5. Codex writes a report under `reports/codex/` and a signal under `signals/waiting-review/`.
6. A reviewer inspects the report, related changes, and acceptance criteria.
7. The reviewer writes a review under `reviews/` and emits a signal under `signals/reviewed/`.
8. Automation routes the verdict to done, blocked, failed, superseded, or a follow-up loop.

## Quick Start

```bash
git clone https://github.com/Gengetau/agent-loop-control-template.git
cd agent-loop-control-template
cp config/project.example.json config/project.json
node scripts/init-project.mjs
node scripts/discover-pending-loops.mjs
node scripts/validate-loop.mjs examples/example-loop.md
```

Use this repository as a GitHub template or fork it for each control-plane installation. Keep control files in this repository, and keep product source code in a separate business repository unless your project explicitly chooses a single-repository workflow.

## Initializing a New Project

1. Copy `config/project.example.json` to `config/project.json`.
2. Replace placeholder repository names with your control and business repositories.
3. Review `config/automation.example.json` and map each workflow to your n8n instance.
4. Keep `state/current.json` generic until the first real loop is approved.
5. Add real loop documents only after human approval rules are understood.

`scripts/init-project.mjs` prints the project files that are expected to be customized. It is conservative by design and does not overwrite history or active loop state.

## Safe Files to Edit

- `config/project.json`: local project settings copied from the example file.
- `config/automation.example.json`: reference automation settings for your installation.
- `templates/`: reusable loop, report, review, and signal templates.
- `docs/`: protocol documentation for humans and agents.
- `schemas/`: validation schemas that can evolve with the protocol.
- `scripts/`: dependency-free helper scripts for validation and discovery.

Do not edit files under workflow state directories by hand unless you are deliberately performing a state transition.

## Workflow Directories

- `loops/waiting-approval/`: loop documents that need human approval before execution.
- `loops/pending/`: approved loop documents that Codex may execute.
- `loops/running/`: loop documents currently claimed by an executor.
- `loops/done/`: completed loop documents.
- `loops/superseded/`: loop documents replaced by newer loops.
- `reports/codex/`: Codex execution reports.
- `reviews/`: reviewer reports and verdicts.
- `signals/waiting-review/`: machine-readable signals that request review.
- `signals/reviewed/`: machine-readable reviewer verdict signals.
- `locks/`: executor lock files for coordination and stale-lock recovery.
- `state/`: current state and append-only history.

Active workflow directories should contain only `.gitkeep` files in a clean template. Real loop files belong there only after a project starts using the template.

## Naming Rules

Loop identifiers use this format:

```text
loop-001-example-task
loop-002-fix-login-flow
loop-003-add-review-checks
```

The canonical loop filename must be exactly `<loop_id>.md`. Dates belong in frontmatter fields, not in filenames.

## Validation

The scripts are intentionally small and dependency-free:

```bash
node scripts/discover-pending-loops.mjs
node scripts/validate-loop.mjs examples/example-loop.md
```

These checks are not a replacement for full automation, but they provide a stable baseline for n8n workflows, GitHub Actions, or local review.
