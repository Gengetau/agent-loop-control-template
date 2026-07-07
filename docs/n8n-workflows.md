# n8n Workflow Boundaries

This repository does not include live n8n workflow exports. The recommended workflows below define boundaries that can be implemented in n8n, GitHub Actions, or another automation layer.

## Loop Intake Workflow

The loop intake workflow receives proposed loop documents from humans or planning agents.

Responsibilities:

- Validate the filename and frontmatter.
- Confirm that the loop id is unique.
- Place approval-required loops in `loops/waiting-approval/`.
- Place pre-approved low-risk loops in `loops/pending/` only when project policy allows it.
- Append an intake event to `state/history.jsonl`.

## Approval Workflow

The approval workflow waits for human approval on loops in `loops/waiting-approval/`.

Responsibilities:

- Notify reviewers that approval is required.
- Record the approval decision.
- Move approved loops to `loops/pending/`.
- Move rejected or replaced loops to `loops/superseded/` or a project-specific rejected path.
- Update `state/current.json`.

## Dispatch Monitor Workflow

The dispatch monitor watches `loops/pending/` and executor locks.

Responsibilities:

- Run discovery using strict filename rules.
- Avoid dispatching a loop that already has an active lock.
- Create or verify a lock before execution.
- Trigger Codex with the loop path and repository context.
- Detect stale locks and move them to `locks/stale/`.

## Review Intake Workflow

The review intake workflow watches `signals/waiting-review/`.

Responsibilities:

- Confirm that the signal points to an existing Codex report.
- Notify a GPT reviewer or human reviewer.
- Provide the loop document, report, and changed files as review inputs.
- Avoid creating duplicate review requests for the same signal.

## Verdict Router Workflow

The verdict router watches `signals/reviewed/`.

Responsibilities:

- Read the verdict and review path.
- Move accepted loops to `loops/done/`.
- Route changes-requested loops back to `loops/pending/` when retry count allows.
- Move blocked loops to a human attention queue.
- Mark superseded loops and connect them to replacement loops.
- Archive active locks.
- Append a verdict event to `state/history.jsonl`.

## Design Notes

Each workflow should make small commits with clear messages. Small commits make automation failures easier to diagnose and make the repository history useful during audits.

Automation should prefer additive writes and file moves over destructive rewrites. State can be reconstructed from Git history and `state/history.jsonl` when transitions are explicit.
