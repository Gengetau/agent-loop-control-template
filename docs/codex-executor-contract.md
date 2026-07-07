# Codex Executor Contract

## Discovery

Codex discovers executable work by scanning `loops/pending/`.

Only files named `<loop_id>.md` are eligible. The `loop_id` in frontmatter must match the filename. This prevents accidental execution of drafts, backups, notes, or date-prefixed files.

Codex should ignore `.gitkeep` and non-Markdown files.

## Claiming Work

Before execution, Codex should create or rely on an active lock under `locks/active/`. The lock should name the loop id, actor, branch, timestamp, and stale timeout.

Codex should create the requested `work_branch` from the loop document when branch creation is part of the task. If the branch already exists, Codex should inspect it before continuing.

## Execution

Codex must read the full loop document before making changes.

Codex should keep changes inside the repositories named by the loop and should avoid unrelated refactors. If the loop points to a business repository, Codex should keep control artifacts in the control repository and product changes in the business repository.

Codex must respect `human_approval_required`. If a loop still requires approval, Codex should report the blocker instead of executing it.

## Reports

After execution, Codex writes a report under `reports/codex/` using `templates/codex-report.md`.

The report must include:

- Loop id.
- Status.
- Related repositories.
- Branch and commit information when available.
- Files inspected.
- Files changed.
- Summary of work.
- Validation performed.
- Errors or uncertainty.
- Next recommendation.

Codex must not invent validation results. A skipped test is useful evidence only when the reason is stated.

## Waiting-Review Signals

After writing the report, Codex writes a JSON signal under `signals/waiting-review/`.

The signal should include the loop id, status, signal type, report path, actor, timestamp, and suggested reviewer action.

The signal is a routing artifact. It should point to the report instead of duplicating the report.

## Failure Handling

If Codex cannot complete the loop, it should still write a report. The report should explain the blocker, partial changes, validation state, and recommended next step.

If Codex made partial changes that should not be kept, it should ask for human direction rather than silently deleting unrelated work.

## Prohibited Actions Without Explicit Instruction

Codex must not:

- Execute unapproved loops from `loops/waiting-approval/`.
- Modify secrets, tokens, credentials, or private environment values.
- Mark its own work as accepted or done.
- Delete history or overwrite `state/history.jsonl`.
- Move unrelated loop files between states.
- Change production automation endpoints unless the loop explicitly requests it and approval exists.

## Required Evidence

Codex should provide enough evidence for a reviewer to reproduce the decision. At minimum, the report should list commands run, files changed, and known gaps.
