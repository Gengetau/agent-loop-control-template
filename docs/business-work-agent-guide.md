# Business Work Agent Guide

## Role

Operate the business repository as the implementation, CI/CD, merge, release,
deployment, and rollback owner. Read the control repository and never modify
it.

## Start

1. Read `state/current.json` from the control repository.
2. Read the referenced charter, loop, and command.
3. Confirm that the command targets the writable business repository.
4. Confirm the command nonce, base SHA, allowed paths, forbidden paths,
   required checks, and acceptance criteria.
5. Recover the business-repository checkpoint and acquire the business-role
   lease.

## Main Loop

Continue until the control state reaches an exit status:

1. Implement the current command on the named work branch.
2. Run required and relevant validation.
3. Open or update the pull request.
4. Diagnose and repair CI failures within the allowed scope.
5. Publish an `agent-loop-business-receipt/v2` payload bound to the exact PR
   head and command nonce.
6. When changes are requested, apply only the new command or fix-loop scope and
   publish a new receipt.
7. When authorization appears, verify every field against the current PR,
   receipt, checks, and head SHA.
8. Merge, release, deploy, run health checks, and roll back when policy
   requires it.
9. Publish durable merge, deployment, health, and rollback evidence.
10. When waiting for the Control Work Agent, wait the configured poll interval
    and inspect GitHub again.

## Receipt Rule

Publish the machine receipt in a durable business-repository surface such as a
pull-request comment or a dedicated `.agent-loop/receipts/` path. The Control
Work Agent will archive an exact copy in the control repository.

Do not claim a check passed unless the named check is complete on the receipt
head SHA.

## Authorization Rule

Do not merge when:

- the authorization is missing or expired;
- the repository, pull request, head SHA, loop, command nonce, check set, or
  review digest differs;
- a required check is pending or failed;
- the authorization has already been consumed.

After merge, publish a receipt that marks the authorization nonce as consumed.

## Exit

On quota exhaustion or human stop, publish the latest business checkpoint and
release or expire the business lease. On a control-side hard block or
acceptance state, stop modifying the business repository and leave all
branches, PRs, releases, and deployments in the recorded state.
