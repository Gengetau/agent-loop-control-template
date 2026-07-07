# Dual-Agent Protocol

## Purpose

The dual-agent protocol coordinates Codex and a GPT Agent through a durable control repository. It keeps planning, execution evidence, review history, and decisions outside the business repository while leaving source code in the business repository.

This protocol is intentionally minimal. It does not require n8n, signal files, locks, watched queues, or a complex state machine.

## Repositories

The control repository stores project context, loop documents, Codex reports, GPT Agent reviews, state pointers, and decisions.

The business repository stores source code, tests, build configuration, and product-facing documentation.

Agents may read both repositories. Codex writes product changes to the business repository and writes reports to the control repository. The GPT Agent writes reviews, next loops, and state updates to the control repository.

## Loop Cycle

1. A human or GPT Agent updates project context under `project/`.
2. A loop file is created under `loops/`.
3. `state/current.md` points to that loop.
4. Codex reads the state pointer, loop file, and relevant project documents.
5. Codex modifies the business repository according to the loop.
6. Codex writes `reports/codex/<loop_id>-codex-report.md`.
7. Codex asks the GPT Agent to review through the available browser or agent channel.
8. The GPT Agent inspects the business repository changes and Codex report.
9. The GPT Agent writes `reviews/gpt-agent/<loop_id>-gpt-review.md`.
10. The GPT Agent either marks the work accepted, creates a fix loop, creates the next feature loop, or blocks for human input.
11. The GPT Agent updates `state/current.md`.

## State Pointer

`state/current.md` is the shared pointer between agents. It should be easy for humans to read and easy for agents to update.

The state pointer names the current loop, latest Codex report, latest GPT review, status, repositories, and notes.

The state pointer does not need to encode every historical event. History lives in committed loop, report, review, project, and decision files.

## Decision History

Use `project/decisions.md` for product, architecture, workflow, and scope decisions that should survive future loops.

The GPT Agent should update this file when review identifies a durable decision. Codex should not invent durable product decisions beyond the current loop.

## Optional Automation

n8n or other automation can be added later for notifications, dashboards, reminders, or multi-project monitoring. Optional automation must not be required to understand or operate the core dual-agent loop.
