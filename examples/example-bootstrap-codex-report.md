# Example Bootstrap Codex Report

This file preserves the original bootstrap execution report as an example artifact. It is intentionally stored under `examples/` so automation does not treat it as active loop evidence.

## Original Loop Id

`loop-001-control-template-bootstrap`

## Original Status

`completed`

## Business Repository

`not-applicable`

## Control Repository

`OWNER/CONTROL_REPO`

## Business Branch

`not-applicable`

## Business Commit

`not-applicable`

## Pull Request

`not-created`

## Executed At

`2026-07-07T00:00:00Z`

## Files Inspected

- `C:/Users/USER/Documents/loop.md`
- `README.md`
- Repository file tree

## Files Changed

- `README.md`
- `docs/control-protocol.md`
- `docs/state-machine.md`
- `docs/codex-executor-contract.md`
- `docs/gpt-reviewer-contract.md`
- `docs/n8n-workflows.md`
- `config/project.example.json`
- `config/automation.example.json`
- `schemas/loop.schema.json`
- `schemas/signal.schema.json`
- `schemas/report.schema.json`
- `schemas/state.schema.json`
- `templates/loop.md`
- `templates/codex-report.md`
- `templates/review.md`
- `templates/waiting-review-signal.json`
- `templates/reviewed-signal.json`
- `loops/waiting-approval/.gitkeep`
- `loops/pending/.gitkeep`
- `loops/running/.gitkeep`
- `loops/done/.gitkeep`
- `loops/superseded/.gitkeep`
- `reports/codex/.gitkeep`
- `reviews/.gitkeep`
- `signals/waiting-review/.gitkeep`
- `signals/reviewed/.gitkeep`
- `locks/active/.gitkeep`
- `locks/archived/.gitkeep`
- `locks/stale/.gitkeep`
- `state/current.json`
- `state/history.jsonl`
- `scripts/init-project.mjs`
- `scripts/validate-loop.mjs`
- `scripts/discover-pending-loops.mjs`
- `scripts/append-history.mjs`
- `examples/example-loop.md`
- `examples/example-codex-report.md`
- `examples/example-review.md`
- `reports/codex/loop-001-control-template-bootstrap-report.md`
- `signals/waiting-review/loop-001-control-template-bootstrap.json`

## Summary

Codex bootstrapped the control repository template with English documentation, reusable templates, JSON schemas, minimal dependency-free Node.js scripts, clean state files, examples, and required workflow placeholders.

## Validation Performed

- `node scripts/discover-pending-loops.mjs`: pending loop discovery returned zero candidates.
- `node scripts/validate-loop.mjs examples/example-loop.md`: example loop validation passed.
- `node --check` on each `.mjs` helper script: all helper scripts passed JavaScript syntax checks.
- JSON parsing: all JSON files parsed successfully.
- Non-English character scan: no Chinese, Japanese, or Korean characters were found.

## Example Note

This preserved report is not active evidence. Future projects should write real reports under `reports/codex/` only while a loop is waiting for review or routing.
