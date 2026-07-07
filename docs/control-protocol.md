# Control Repository Protocol

## Purpose

The control repository is the shared coordination surface for agent-loop work. It keeps planning, execution, review, signals, locks, and state in a durable GitHub repository so that humans and automation can inspect every transition.

The protocol favors plain files over hidden service state. This makes the workflow auditable, easy to fork, and resilient when one actor stops or fails.

## Directory Responsibilities

`loops/` stores canonical loop documents. A loop document is the source of truth for intent, scope, acceptance criteria, approval requirements, and retry policy.

`reports/` stores active execution evidence. Codex reports should explain what was inspected, what changed, how validation was performed, and what uncertainty remains. In a clean template, active report directories should contain only placeholders.

`reviews/` stores reviewer decisions. Review files should compare the result with the loop document and produce a verdict that automation can route.

`signals/` stores active machine-readable events. Signals let n8n or another monitor discover that a loop is waiting for review or that a review verdict is ready. Because automation watches these directories, examples and old signals must not remain in active signal paths.

`locks/` stores executor coordination files. A lock makes it visible that an actor has claimed work and gives automation a place to detect stale execution.

`state/` stores small global state. `state/current.json` is the current control-plane snapshot, and `state/history.jsonl` is append-only event history.

`templates/` stores reusable source files that future projects copy when creating loops, reports, reviews, and signals.

`schemas/` stores validation schemas. The schemas are intentionally useful but not overly strict so that projects can extend metadata without breaking older automation.

`config/` stores project and automation examples. Real deployments may copy these files and replace placeholders.

`docs/` stores the human-readable protocol and role contracts.

`examples/` stores non-active sample loops, reports, reviews, and signals. Automation should ignore this directory.

## Loop File Lifecycle

Loop documents begin as planned work. A planner fills out `templates/loop.md`, gives the loop a canonical `loop_id`, and names the file `<loop_id>.md`.

If the loop needs human approval, it should remain in `loops/waiting-approval/` until a human approves it. Approval is a boundary because agents should not unilaterally execute work that changes business behavior, spends money, touches credentials, or has unclear risk.

After approval, automation moves the file to `loops/pending/`. Codex may discover only pending loop files whose names match their `loop_id`.

When Codex claims a loop, automation or Codex may move the file to `loops/running/` and create a lock under `locks/active/`. This prevents duplicate execution.

When execution completes, Codex writes a report and a waiting-review signal. The loop remains reviewable until the reviewer emits a verdict.

After review, automation routes the loop to `loops/done/`, `loops/superseded/`, or another project-specific terminal or retry path.

After routing, automation should archive or move signals out of watched active directories. This prevents a newly forked template or restarted watcher from processing stale artifacts.

## Signal File Responsibilities

Signals are small JSON files for automation. They should include the loop id, signal type, status, related artifact paths, actor, timestamp, and any routing hints.

Signals are not the place for long narrative content. Long explanations belong in reports and reviews because Markdown is easier for humans to read.

Waiting-review signals point to Codex reports. Reviewed signals point to review files and include a verdict.

Waiting-review signals must include `report_path`. Reviewed signals must include `review_path` and `verdict`. These conditional requirements let automation reject incomplete routing artifacts before they trigger downstream workflows.

## Report File Responsibilities

Reports are written by Codex after execution. A report should be honest about changed files, validation commands, errors, uncertainty, and next recommendations.

Reports should not claim that a check passed unless the command actually ran. If a command was skipped, the report should say why.

Reports under `reports/codex/` are active evidence while a loop is being reviewed or routed. Example reports belong under `examples/`, not under watched report directories.

## Review File Responsibilities

Reviews are written by GPT or another reviewer. A review should list completed items, missing items, risks, spec deviations, human decisions, and the recommended next state.

The reviewer should treat the loop document as the contract. If implementation is useful but outside scope, the review should name that deviation instead of silently accepting it.

## Lock File Responsibilities

Locks coordinate executors. A lock should identify the loop, actor, branch, claimed timestamp, and expected stale timeout.

Locks should be small and machine-readable. Automation may move old locks from `locks/active/` to `locks/stale/` when the executor disappears.

Archived locks go to `locks/archived/` after the associated loop reaches a terminal state.

## State File Responsibilities

`state/current.json` gives automation a quick snapshot of the control plane. It should remain small enough to inspect in a pull request.

`state/history.jsonl` is append-only. Each line is a JSON event. Appending avoids accidental loss of audit history and makes it easy for simple scripts to process changes.

## Naming Conventions

Loop ids use `loop-<three-digit-number>-<kebab-case-title>`.

The canonical loop filename is `<loop_id>.md`.

Report files should use `<loop_id>-report.md`.

Review files should use `<loop_id>-review.md`.

Signal files should use `<loop_id>.json`.

These rules let simple automation find related artifacts without a database.

Reusable templates use placeholders such as `OWNER/CONTROL_REPO`. Schema `$id` values may refer to this source template repository because `$id` identifies the schema document, not the target control repository configured by a future project.

## Human Approval Boundaries

Human approval is required when a loop asks agents to modify production behavior, touch secrets, spend money, delete data, change access control, create public releases, or make high-impact architectural decisions.

The planner should set `human_approval_required` and explain the approval need in the loop body. Codex must respect that field and should not execute an unapproved loop from `loops/waiting-approval/`.

## Actor Interaction Through GitHub

GPT creates or reviews Markdown and JSON artifacts through commits or pull requests.

Codex executes approved work and records evidence in reports and signals.

n8n monitors file paths and routes transitions. It should make small, reviewable commits that move files between state directories.

Humans review pull requests, approve risky loops, and resolve ambiguous decisions.

GitHub provides the audit log. Every important state transition should be visible as a file change so that project maintainers can reconstruct what happened.
