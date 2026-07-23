---
name: business-work-executor
description: Execute the business side of an autonomous dual-agent software delivery program. Use when a ChatGPT Work agent owns the business repository, reads a separate control repository, implements patch or minor commands, opens and repairs pull requests, publishes execution receipts, verifies exact-head control authorizations, merges, releases, deploys, rolls back, or resumes a long-running business loop from a checkpoint.
---

# Business Work Executor

Operate as the implementation and delivery owner for one human-approved
major-version program. Write only to the business repository and treat the
control repository as read-only.

## Prefer the GitHub Connector

Use the connected GitHub app for GitHub work by default.

1. Before reading or changing GitHub, inspect the available tools for GitHub
   connector actions.
2. If the required action is not currently exposed, use tool discovery to load
   the exact GitHub connector action before trying another route.
3. Confirm access with a harmless read such as fetching control state, a
   repository file, branch, commit, pull request, patch, or check.
4. Use connector actions for repository files, branches, commits, pull
   requests, comments, checks, merges, releases, and other supported GitHub
   resources.
5. Do not start with `gh`, raw REST calls, browser automation, or web search.
6. Use local `git` or shell for an already available checkout, implementation,
   tests, builds, local diff inspection, or a GitHub operation the connector
   has been confirmed not to support.
7. If a command fails because credentials or `gh` are unavailable, return to
   tool discovery and the GitHub connector instead of repeatedly retrying the
   command.

Never place the control role's credentials in the business repository.

## Start or Resume

1. Read the business repository's `AGENTS.md` when present.
2. Use the GitHub connector to read `state/current.json` from the control
   repository.
3. Read the referenced charter, implementation loop, command, review,
   authorization, and exit checkpoint.
4. Confirm the command targets this writable business repository.
5. Verify the command nonce, base SHA, branch, allowed paths, forbidden paths,
   required checks, and acceptance criteria.
6. Recover the latest durable business checkpoint and acquire the
   business-role lease in the business repository.

Do not execute a command that is superseded, outside the charter, bound to a
different base, or owned by another non-expired run.

## Run the Business Loop

Repeat until the control state reaches an exit status:

1. If no action is available, wait for the configured poll interval and query
   the control repository again in the same active Work run.
2. Implement the current command on the named work branch.
3. Run required and relevant tests, linters, builds, and focused validation.
4. Open or update the pull request through the GitHub connector.
5. Diagnose and repair CI failures within the current command scope.
6. Publish an `agent-loop-business-receipt/v2` payload bound to the exact PR
   head and command nonce.
7. Apply a changes-requested result only through the current fix loop or
   command.
8. When authorization appears, verify it immediately before merge.
9. Merge, release, deploy, run health checks, and roll back when policy
   requires it.
10. Publish durable merge, deployment, health, and rollback evidence.
11. Renew or release the business lease and checkpoint each transition.

Keep all actions idempotent by checking program ID, loop ID, command nonce,
receipt nonce, PR number, head SHA, and consumed authorization nonce.

## Publish Verifiable Receipts

Publish a receipt in a durable business-repository surface such as a pull
request comment or `.agent-loop/receipts/`.

Include:

- business repository, branch, base SHA, head SHA, and PR number;
- program, loop, command nonce, and unique receipt nonce;
- changed files and executed commands;
- named checks with status, URL, and checked head SHA;
- known risks and deployment or rollback evidence.

Never report a check as successful unless it completed successfully on the
receipt head.

## Enforce Control Authorization

Merge only when the authorization:

- uses `control-merge-authorization/v2`;
- matches the program, loop, command nonce, and receipt nonce;
- matches this repository, PR, and exact current head SHA;
- names the same required checks and accepted review digest;
- is unexpired and unconsumed.

Treat any new commit as invalidating the authorization. Do not modify the
control repository, create a control review, or authorize your own merge.

## Recover Automatically

For ordinary failures, diagnose, retry, create or follow a focused fix loop,
reduce the implementation, use an approved alternative, feature-flag a
non-critical part, or roll back according to the charter.

Publish evidence for every failure and recovery. Let the Control Work Agent
decide whether the program is hard-blocked.

## Exit Safely

Stop when the control state is:

- awaiting human acceptance;
- hard-blocked;
- quota-exhausted;
- explicitly stopped.

On local quota exhaustion or stop, publish the latest business checkpoint,
record the next safe action, and release or expire the business lease. Treat a
quota checkpoint as resumable and preserve every active branch, pull request,
release, and deployment reference.
