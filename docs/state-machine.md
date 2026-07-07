# State Machine

## States

`idle` means no active loop is currently being executed.

`waiting-approval` means a loop exists but needs human approval before execution.

`pending` means a loop is approved and ready for Codex discovery.

`running` means an executor has claimed the loop and is working on it.

`waiting-review` means execution has completed and a reviewer must inspect the result.

`reviewed` means a reviewer has issued a verdict.

`done` means the loop was accepted and no further action is required.

`blocked` means progress cannot continue without a human decision or external change.

`failed` means execution or review failed in a way that should be recorded as terminal unless a follow-up loop is created.

`superseded` means another loop replaced this loop.

## Transition Table

| From | To | Actor | Required artifact |
| --- | --- | --- | --- |
| `idle` | `waiting-approval` | GPT planner or human | Loop file in `loops/waiting-approval/` |
| `idle` | `pending` | Human or trusted automation | Approved loop file in `loops/pending/` |
| `waiting-approval` | `pending` | Human or approval workflow | Approval evidence and moved loop file |
| `waiting-approval` | `superseded` | Human or GPT planner | Replacement loop reference |
| `pending` | `running` | Codex or dispatch workflow | Active lock and running loop file |
| `running` | `waiting-review` | Codex | Codex report and waiting-review signal |
| `running` | `blocked` | Codex | Report explaining blocker |
| `running` | `failed` | Codex or automation | Failure report |
| `waiting-review` | `reviewed` | GPT reviewer or human reviewer | Review file and reviewed signal |
| `reviewed` | `done` | Verdict router workflow | Accepted verdict |
| `reviewed` | `pending` | Verdict router workflow | Retry decision and retry count check |
| `reviewed` | `blocked` | Verdict router workflow | Human decision required |
| `reviewed` | `failed` | Verdict router workflow | Rejected terminal verdict |
| `reviewed` | `superseded` | GPT planner or human | Follow-up loop reference |
| `blocked` | `pending` | Human | Unblock decision |
| `blocked` | `superseded` | Human or GPT planner | Replacement loop |
| `failed` | `superseded` | Human or GPT planner | Replacement loop |

## Actor Rules

GPT planners may create loop documents and propose transitions, but they should not bypass required human approval.

Codex may claim approved pending work, create execution evidence, and report blockers. Codex should not mark its own work as accepted.

Reviewers may move work into `reviewed` by producing review artifacts. They should not hide missing acceptance criteria behind a successful verdict.

n8n may perform mechanical moves and routing after required artifacts exist.

Humans may approve, reject, unblock, or supersede loops at any point.

## Retry Policy

Each loop may include retry and follow-up metadata:

- `attempt`: the positive attempt number for the current execution of a loop. The first execution is `1`.
- `retry_count`: the number of completed retries after failed or changes-requested outcomes. The first execution normally starts at `0`.
- `max_retry_count`: the non-negative limit for retries before the loop should be escalated or replaced.
- `parent_loop_id`: the loop that caused this follow-up or replacement loop, or `null` for standalone work.

Automation should update `attempt` and `retry_count` consistently before moving a reviewed loop back to `pending`.

When the retry limit is reached, the loop should move to `blocked`, `failed`, or `superseded` with a clear explanation.

Follow-up fix loops should usually create a new `loop_id` and set `parent_loop_id` to the earlier loop. Reusing the same loop id is better reserved for mechanical retries that do not change scope.
