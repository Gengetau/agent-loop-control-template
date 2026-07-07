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

This example loop demonstrates the shape of a task that Codex can execute against a business repository.

## Implementation Goal

Update one placeholder documentation page in the business repository.

## Allowed Changes

- Documentation files in the business repository.

## Forbidden Changes

- Application source code.
- Credentials, secrets, or deployment configuration.

## Required Commands

- Run the repository's documentation validation command if one exists.

## Required Outputs

- A business repository change on `codex/loop-001-example`.
- `reports/codex/loop-001-example-codex-report.md`.

## Acceptance Criteria

- The change is limited to documentation.
- The report lists commands run and validation evidence.
- No secrets or environment-specific values are added.

## Review Instructions

The GPT Agent should inspect the business repository diff, Codex report, and validation evidence.

## Next-Loop Planning Hints

If accepted, create the next implementation loop. If validation is missing, create a fix loop that asks Codex to add or run the required validation.
