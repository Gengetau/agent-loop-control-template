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

Summarize the project context Codex needs before making changes. Link to relevant files under `project/` and the business repository.

## Implementation Goal

Describe the concrete change Codex should make in the business repository.

## Allowed Changes

List the files, directories, or behaviors Codex may modify.

## Forbidden Changes

List anything Codex must not modify, even if it looks related.

## Required Commands

List commands Codex must run, such as tests, linters, builds, or focused validation scripts.

## Required Outputs

List required business repository changes and the Codex report path.

## Acceptance Criteria

Define the checks a reviewer should use to decide whether the loop is complete.

## Review Instructions

Tell the GPT Agent what to inspect during review.

## Next-Loop Planning Hints

Suggest likely follow-up work if this loop is accepted or changes are requested.

## Retry and Follow-Up Metadata

Use `attempt` for the current execution attempt number for this loop. Use `retry_count` for the number of completed retries after a failed or changes-requested attempt. Keep `max_retry_count` as the retry limit. Use `parent_loop_id` when this loop follows or replaces an earlier loop; otherwise leave it as `null`.
