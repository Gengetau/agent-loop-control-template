---
schema_version: 1
loop_id: loop-001-example-task
title: Example Task
status: waiting-approval
risk_level: low
execution_mode: business-repo
business_repo: OWNER/BUSINESS_REPO
control_repo: Gengetau/agent-loop-control-template
business_base_branch: main
work_branch: codex/loop-001-example-task
human_approval_required: true
created_at: 2026-01-01T00:00:00Z
created_by: GPT Planning Agent
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
