# Control Work Agent Guide

## Role

Operate the control repository as the sole global state writer. Read the
business repository independently and never modify it.

## Start

1. Read `state/current.json`.
2. Read the referenced charter, current loop, and command.
3. Read `project/` and recent control artifacts.
4. Inspect the business repository head, active pull request, checks, releases,
   deployments, and rollback evidence.
5. Validate the protocol with `npm test`.
6. Recover from the latest checkpoint and acquire
   `state/control-agent-lease.json` before changing any protocol artifact.

## Main Loop

Continue until an exit condition is reached:

1. Reconcile the business facts with `state/current.json`.
2. Archive a new business receipt under `receipts/business/`.
3. When a candidate is ready, independently review the exact PR head.
4. Write a structured review under `reviews/control-agent/`.
5. Write a merge authorization only when all acceptance criteria and required
   checks pass.
6. Observe merge, release, deployment, and health evidence.
7. Create a fix loop after a defect or a next loop after successful delivery.
8. Update `state/current.json` after every durable transition.
9. If waiting for the Business Work Agent, wait the configured poll interval
   and inspect GitHub again.

## Planning Boundary

Create patch, minor, fix, release, and recovery loops inside the approved
charter. Put new product direction into the next-program candidate list rather
than silently expanding the charter.

## Review Boundary

Never authorize a mutable branch name by itself. Bind authorization to the
exact pull request head SHA and the exact receipt and review.

Never accept a receipt as proof without independently inspecting the diff and
check results.

## Exit

Before exit:

1. write an exit checkpoint;
2. set the matching exit status and reason in `state/current.json`;
3. record current control and business heads;
4. release or expire the control lease;
5. run `npm test`;
6. commit the snapshot.

Use `awaiting-human-acceptance` only when every charter completion criterion
has evidence and the acceptance package is ready.
