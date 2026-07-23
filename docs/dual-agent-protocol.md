# Work-Native Dual-Agent Protocol

## Purpose

This protocol lets two long-running ChatGPT Work tasks deliver patch and minor
versions autonomously while preserving a human-approved major-version
direction.

The control repository is the authoritative global state. The business
repository is the authoritative source, pull request, CI, release, deployment,
and rollback record.

## Roles

### Human Owner

The human owner writes or approves the major-version charter and accepts the
finished major version. Normal implementation loops, reviews, fixes, merges,
deployments, and rollbacks do not require human participation.

### Control Work Agent

The Control Work Agent has write access to the control repository and read-only
access to the business repository. It owns:

- program-state transitions;
- small-version and fix-loop decomposition;
- independent review;
- exact-head merge authorization;
- business receipt archival;
- completion, hard-block, and quota checkpoints.

### Business Work Agent

The Business Work Agent has write access to the business repository and
read-only access to the control repository. It owns:

- branches, implementation, tests, and pull requests;
- CI diagnosis and repair;
- machine-readable execution receipts;
- authorization verification;
- merge, release, deployment, health checks, and rollback.

## Global State Machine

`state/current.json` is the only authoritative global state file.

Active statuses:

- `dispatching`
- `business-executing`
- `ci-verifying`
- `control-reviewing`
- `changes-requested`
- `merge-authorized`
- `deploying`
- `advancing-version`

Exit statuses:

- `awaiting-human-acceptance`
- `hard-blocked`
- `quota-exhausted`
- `stopped`

Only the Control Work Agent updates the global status. The Business Work Agent
publishes facts in the business repository; the Control Work Agent observes
those facts, archives the receipt, and advances the state.

## Program and Implementation Loops

A **program** represents one human-approved major version. Its charter remains
stable until human acceptance or an explicit human amendment.

An **implementation loop** represents one patch, minor step, bug fix, release,
or recovery action. The Control Work Agent may create and supersede
implementation loops as long as they remain inside the program charter.

## Two-Phase Merge

### Phase 1: Candidate

The Business Work Agent implements a command, opens or updates a pull request,
runs CI, and publishes an `agent-loop-business-receipt/v2` payload bound to the
command nonce and pull-request head SHA.

### Phase 2: Authorization

The Control Work Agent independently reads the command, loop, diff, checks, and
receipt. It writes:

1. a `control-review/v2` artifact; and
2. when accepted, a `control-merge-authorization/v2` artifact.

The authorization must bind:

- program and loop;
- business repository;
- pull request number;
- exact head SHA;
- command nonce;
- required checks;
- review digest;
- authorization nonce;
- expiry.

The Business Work Agent validates every bound field immediately before merge.
Any new commit invalidates the authorization and requires a new review.

## Long-Running Work Loop

Each role runs one active Work task:

```text
repeat:
  read the authoritative repositories
  verify or acquire the role lease
  recover from the latest durable checkpoint

  if an action is available:
    execute one safe transition
    write the artifact and checkpoint
    continue

  if the major version is ready:
    checkpoint(awaiting-human-acceptance)
    exit

  if all allowed recovery paths are exhausted:
    checkpoint(hard-blocked)
    exit

  if quota is exhausted or at its reserved stop threshold:
    checkpoint(quota-exhausted)
    exit

  wait poll_interval_seconds
```

The default poll interval is 300 seconds. Polling occurs inside the active Work
run; it is not a recurring Scheduled Task.

## Idempotency and Leases

Every command, receipt, review, authorization, and checkpoint has a stable
schema, program ID, loop ID, nonce or referenced nonce, and timestamp.

Each role stores a lease only in its writable repository. A run must not act
when another non-expired lease owns the same role and transition. A recovery
run may take over an expired lease and must preserve the previous run ID in its
checkpoint.

No action should depend on chat memory alone. Commit or publish a durable fact
before moving to the next state.

## Automatic Recovery Before Hard Block

The agents must try the recovery options allowed by the charter before using
`hard-blocked`:

1. diagnose and retry within the loop retry budget;
2. create a focused fix loop;
3. reduce or split the change;
4. use an approved alternative implementation;
5. disable a non-critical feature behind a flag;
6. roll back a failed release;
7. defer an out-of-scope or non-critical item to the next program.

The hard-block incident must include attempts, evidence, why each recovery path
failed, current repository heads, active pull request, and the safest resume
point.

## Exit Semantics

| Exit status | Required exit reason | Meaning |
| --- | --- | --- |
| `awaiting-human-acceptance` | `major-version-ready` | The acceptance package and product artifact are ready |
| `hard-blocked` | `hard-blocked` | No charter-permitted recovery path remains |
| `quota-exhausted` | `quota-exhausted` | The active run stops with a resumable checkpoint |
| `stopped` | `human-stop` | The human explicitly stopped the program |

Every exit state requires `exit_checkpoint` in `state/current.json`. Quota exit
ends the active agent run but does not cancel the major-version program.

## Scheduled Recovery

An optional native Scheduled Task may periodically check whether a program has
a resumable exit or stale lease. It only restores a Work loop from the
repository checkpoint. Normal five-minute coordination remains inside the
active long-running Work tasks.
