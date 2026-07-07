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

Explain why this loop exists and what user or project outcome it should create.

## Executor Goal

Describe the concrete result Codex must produce. Keep this focused on observable repository changes.

## Scope

List the files, directories, repositories, or behaviors Codex may change.

## Out of Scope

List anything Codex must not change during this loop, even if it looks related.

## Required Outputs

List every artifact Codex must create or update, including reports and signals.

## Acceptance Criteria

Define the checks a reviewer should use to decide whether the loop is complete.

## Reviewer Checks

Describe the evidence the reviewer should inspect, including commands, changed files, reports, and risks.

## Human Approval Needed

Explain whether human approval is required and which decision the human is approving.

## Retry and Follow-Up Metadata

Use `attempt` for the current execution attempt number for this loop. Use `retry_count` for the number of completed retries after a failed or changes-requested attempt. Keep `max_retry_count` as the retry limit. Use `parent_loop_id` when this loop follows or replaces an earlier loop; otherwise leave it as `null`.
