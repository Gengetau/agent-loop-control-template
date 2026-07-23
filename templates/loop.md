---
schema_version: 2
program_id: PROGRAM_ID
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
# LOOP_ID: TITLE

## Background Context

Summarize only the project context needed for this implementation step.

## Implementation Goal

Describe one concrete business-repository outcome.

## Allowed Changes

## Forbidden Changes

## Required Commands

## Required Outputs

List the required business change, pull request, machine-readable business
receipt, tests, and deployment evidence.

## Acceptance Criteria

## Review Instructions

Tell the Control Work Agent what to inspect during independent review.

## Next-Loop Planning Hints

Describe how this loop advances the major-version charter and which follow-up
loops are allowed if it is accepted or changes are requested.

## Retry and Follow-Up Metadata

Use `attempt` for the current execution attempt number and `retry_count` for
completed retries. Before declaring a hard block, apply the recovery policy in
the major-version charter and record every failed alternative.
