# Codex Executor Guide

## Primary Rule

Codex executes the current loop. It does not choose the long-term roadmap, create product strategy, or decide the next loop unless the current loop explicitly asks for that.

## Execution Steps

1. Read `state/current.md`.
2. Stop if `status` is `blocked` or `done`.
3. Read the file named by `current_loop`.
4. Read relevant files under `project/`.
5. Modify the business repository, not the control repository, unless writing the required Codex report.
6. Run the commands required by the loop.
7. Run any reasonable local validation that fits the change.
8. Write `reports/codex/<loop_id>-codex-report.md`.
9. Send a review request to the GPT Agent through the available browser or agent channel.
10. Stop if no next loop exists or if the state says `blocked` or `done`.

## Control Repository Writes

Codex may write Codex reports and small execution notes requested by the loop.

Codex should not update `state/current.md` to point to the next loop. That is the GPT Agent reviewer and planner responsibility.

## Report Requirements

The Codex report must include changed files, commands run, tests run, validation evidence, known limitations, and a review request summary.

If validation was skipped, Codex must say why. If Codex cannot complete the loop, the report should explain the blocker and the safest next step.

## Boundaries

Codex must not add secrets, credentials, or private environment values.

Codex must not modify unrelated business repository areas just because they are nearby.

Codex must not turn optional automation into a required workflow unless a loop explicitly requests that architectural change.
