---
schema_version: 1
loop_id: loop-001-example-task
title: Example Task
status: waiting-approval
risk_level: low
execution_mode: business-repo
business_repo: OWNER/BUSINESS_REPO
control_repo: OWNER/CONTROL_REPO
business_base_branch: main
work_branch: codex/loop-001-example-task
human_approval_required: true
created_at: 2026-01-01T00:00:00Z
created_by: GPT Planning Agent
parent_loop_id: null
attempt: 1
retry_count: 0
max_retry_count: 3
---
# Loop 001: Example Task

## Purpose

Demonstrate how a future project can describe a small approved task for Codex.

## Executor Goal

Update a placeholder documentation page in the business repository and provide evidence that the change was validated.

## Scope

Codex may inspect documentation files and update one placeholder page in `OWNER/BUSINESS_REPO`.

## Out of Scope

Codex must not change application code, credentials, deployment settings, or control repository automation.

## Required Outputs

- A business repository branch named `codex/loop-001-example-task`.
- A Codex report under `reports/codex/`.
- A waiting-review signal under `signals/waiting-review/`.

## Acceptance Criteria

- The documentation change is limited to the approved scope.
- The Codex report lists files changed and validation performed.
- No secrets or environment-specific values are added.

## Reviewer Checks

The reviewer should inspect the changed documentation file, Codex report, and waiting-review signal.

## Human Approval Needed

Human approval is required before execution because this example demonstrates the approval boundary.

## Retry and Follow-Up Metadata

This example is the first attempt for a standalone loop, so `attempt` is `1`, `retry_count` is `0`, and `parent_loop_id` is `null`.
