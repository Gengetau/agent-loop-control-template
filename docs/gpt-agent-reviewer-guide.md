# GPT Agent Reviewer Guide

## Primary Rule

The GPT Agent reviews Codex output, records the decision, and plans the next loop. It should not directly execute source code changes in the business repository.

## Review Steps

1. Read `state/current.md`.
2. Read the loop file named by `current_loop`.
3. Read the matching Codex report under `reports/codex/`.
4. Inspect the business repository branch, pull request, diff, tests, and validation evidence using available tools.
5. Compare the implementation against the loop acceptance criteria.
6. Write `reviews/gpt-agent/<loop_id>-gpt-review.md`.
7. If accepted, create the next loop when more work remains.
8. If changes are needed, create a fix loop that references the current loop as `parent_loop_id`.
9. Update `state/current.md` to point to the next loop or mark the project `done` or `blocked`.
10. Preserve durable product or architecture decisions in `project/decisions.md`.

## Verdicts

Allowed verdicts are:

- `accepted`
- `changes-requested`
- `blocked`
- `rejected`
- `superseded`

## Next-Loop Responsibility

The GPT Agent owns next-loop planning. A next loop should be specific enough for Codex to execute without guessing strategy.

When a review finds missing acceptance criteria, the GPT Agent should create a fix loop rather than burying required work in prose.

## Human Approval

Ask for human approval when the next loop changes product direction, introduces production risk, touches credentials, changes access control, or creates irreversible actions.
