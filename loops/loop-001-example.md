---
schema_version: 2
program_id: example-v1
loop_id: loop-001-example
title: Example Implementation Loop
status: dispatched
target_version: 1.0.1
target_business_repo: OWNER/BUSINESS_REPO
target_branch: agent/loop-001-example
control_repo: OWNER/CONTROL_REPO
command_path: commands/loop-001-example.json
created_at: 2026-01-01T00:00:00Z
created_by: Control Work Agent
parent_loop_id: null
attempt: 1
retry_count: 0
max_retry_count: 3
---
# Loop 001: Example Implementation Loop

## Background Context

This example loop is one autonomous small-version step inside the
`example-v1` major-version program.

## Implementation Goal

Update one placeholder documentation page in the business repository.

## Allowed Changes

- Documentation files in the business repository.

## Forbidden Changes

- Application source code.
- Credentials, secrets, deployment configuration, or protected policy files.

## Required Commands

- Run the repository's documentation validation command if one exists.

## Required Outputs

- A business repository change on `agent/loop-001-example`.
- A pull request whose body or comments contain an
  `agent-loop-business-receipt/v2` payload.
- An archived receipt under `receipts/business/` after the Control Work Agent
  observes the business result.

## Acceptance Criteria

- The change is limited to documentation.
- The receipt lists commands, changed files, exact head SHA, and validation
  evidence.
- No secrets or environment-specific values are added.

## Review Instructions

The Control Work Agent should inspect the exact pull request head, changed
files, required checks, test evidence, and business receipt.

## Next-Loop Planning Hints

If accepted, write a structured control review and an exact-head merge
authorization. If changes are required, create a fix loop and a new command.
