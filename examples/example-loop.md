---
schema_version: 1
loop_id: loop-001-example
title: Example Implementation Loop
status: ready-for-codex
target_business_repo: OWNER/BUSINESS_REPO
target_branch: codex/loop-001-example
control_repo: OWNER/CONTROL_REPO
created_at: 2026-01-01T00:00:00Z
created_by: GPT Planning Agent
parent_loop_id: null
attempt: 1
retry_count: 0
max_retry_count: 3
---
# Loop 001: Example Implementation Loop

## Background Context

This example shows a small loop for Codex to execute against a business repository.

## Implementation Goal

Update a placeholder documentation page in the business repository and provide evidence that the change was validated.

## Allowed Changes

- Documentation files in `OWNER/BUSINESS_REPO`.

## Forbidden Changes

- Application code.
- Credentials, secrets, deployment settings, or control repository protocol files.

## Required Commands

- Run documentation validation if the business repository provides it.

## Required Outputs

- A business repository branch named `codex/loop-001-example`.
- A Codex report under `reports/codex/`.

## Acceptance Criteria

- The documentation change is limited to the approved scope.
- The Codex report lists files changed and validation performed.
- No secrets or environment-specific values are added.

## Review Instructions

The GPT Agent should inspect the changed documentation file, Codex report, and validation evidence.

## Next-Loop Planning Hints

If accepted, create the next loop. If validation is missing, create a fix loop.

## Retry and Follow-Up Metadata

This example is the first attempt for a standalone loop, so `attempt` is `1`, `retry_count` is `0`, and `parent_loop_id` is `null`.
