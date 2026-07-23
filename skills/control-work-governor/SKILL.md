---
name: control-work-governor
description: Govern the control side of an autonomous dual-agent software delivery program. Use when a ChatGPT Work agent owns the control repository, reads a separate business repository, reviews implementation receipts and pull requests, issues exact-head merge authorizations, creates patch or minor loops, advances the major-version state, or resumes a long-running control loop from a checkpoint.
---

# Control Work Governor

Operate as the sole global state writer for one human-approved major-version
program. Write only to the control repository and treat the business repository
as read-only.

## Prefer the GitHub Connector

Use the connected GitHub app for GitHub work by default.

1. Before reading or changing GitHub, inspect the available tools for GitHub
   connector actions.
2. If the required action is not currently exposed, use tool discovery to load
   the exact GitHub connector action before trying another route.
3. Confirm access with a harmless read such as fetching the current state,
   repository file, branch, commit, pull request, or patch.
4. Use connector actions for repository files, branches, commits, pull
   requests, comments, checks, and other supported GitHub resources.
5. Do not start with `gh`, raw REST calls, browser automation, or web search.
6. Use local `git` or shell only for an already available checkout, local
   validation, diff inspection, or a GitHub operation the connector has been
   confirmed not to support.
7. If a command fails because credentials or `gh` are unavailable, return to
   tool discovery and the GitHub connector instead of repeatedly retrying the
   command.

Never place the other role's credentials in this repository.

## Start or Resume

1. Read `AGENTS.md` when present.
2. Read `state/current.json`.
3. Read the referenced charter, loop, command, receipt, review,
   authorization, checkpoint, and control lease.
4. Read relevant durable project documents.
5. Use the GitHub connector to inspect the business repository head, active
   pull request, exact patch, checks, releases, deployments, and rollback
   evidence.
6. Run the control repository's protocol validator.
7. Recover the last durable transition and acquire the control-role lease.

Do not infer program state from chat memory when a committed artifact exists.

## Run the Control Loop

Repeat until an exit condition is reached:

1. Reconcile control state with current business-repository facts.
2. If no action is available, wait for the configured poll interval and query
   GitHub again in the same active Work run.
3. Archive every new business receipt in the control repository.
4. Independently inspect the exact PR head and required checks.
5. Write a structured control review.
6. Issue a merge authorization only for an accepted review and exact receipt
   head.
7. Observe merge, deployment, health, and rollback evidence.
8. Create the next patch, minor, fix, release, or recovery loop within the
   charter.
9. Commit each artifact before advancing `state/current.json`.
10. Run protocol validation after every state transition.

Keep all actions idempotent by binding them to program ID, loop ID, command
nonce, receipt nonce, PR number, and commit SHA.

## Protect Merge Authority

Never authorize a mutable branch name by itself. Bind the authorization to:

- control and business repository identities;
- program and loop;
- command and receipt nonces;
- pull request and exact head SHA;
- required checks;
- review digest;
- authorization nonce and expiry.

Treat a new business commit as invalidating the prior review and authorization.
Never modify product code or merge a business pull request from this role.

## Recover Automatically

Before declaring a hard block, apply the charter's permitted recovery paths:
retry, diagnose, split the change, create a focused fix loop, choose an allowed
alternative, disable a non-critical feature, roll back, or defer out-of-scope
work.

Record every failed attempt and why no permitted recovery remains.

## Exit Safely

Exit only for:

- major-version readiness for human acceptance;
- a proven hard block;
- quota exhaustion or reserved quota threshold;
- explicit human stop.

Before exit, write the matching checkpoint, record both repository heads and
the next safe action, update the global exit status, release or expire the
control lease, validate the protocol, and commit the snapshot.

Treat quota exhaustion as resumable. Do not mark the major-version program
complete merely because the active Work run ended.
