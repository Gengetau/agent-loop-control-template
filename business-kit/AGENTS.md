# Business Repository Agent Instructions

## Repository Role

Treat this repository as the writable implementation and delivery plane. Treat
the configured control repository as read-only.

## GitHub Operations

Use the connected GitHub app first. Discover the exact GitHub connector action
before using `gh`, raw REST, browser automation, or web search. Use local
commands for implementation and validation, not as the default way to recover
missing GitHub tools.

## Required Workflow

1. Read the current control state, charter, loop, and command.
2. Acquire `.agent-loop/runtime.json` before starting a transition.
3. Keep changes inside the command's allowed scope.
4. Run required checks and publish an exact-head business receipt.
5. Merge only after `control-authorization-gate.mjs` accepts the active control
   authorization.
6. Publish merge, deployment, health, and rollback evidence.
7. Checkpoint every transition and release or expire the lease on exit.

## Boundaries

- Do not write the control repository.
- Do not authorize your own merge.
- Do not modify the authorization workflow or gate unless the charter and
  command explicitly allow that policy change.
- Do not commit credentials or tokens.
