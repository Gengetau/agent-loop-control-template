# Business Repository Contract

The business repository remains the source of truth for code and delivery
facts. It should expose enough durable metadata for the Control Work Agent to
review it without write access.

## Required Capabilities

- The Business Work Agent can create branches, commits, pull requests, merge,
  release, deploy, and roll back.
- The Control Work Agent can read branches, commits, pull requests, checks,
  releases, deployments, and agent receipts.
- Required CI checks run on every candidate head.
- Protected policy and workflow files cannot be changed by an ordinary
  autonomous implementation loop unless the charter explicitly allows it.

## Runtime State

Keep the Business Work Agent lease and checkpoint in a durable
business-repository surface. A minimal `.agent-loop/runtime.json` may contain:

```json
{
  "schema": "business-agent-runtime/v2",
  "program_id": "example-v1",
  "loop_id": "loop-001-example",
  "run_id": "WORK_RUN_ID",
  "lease_expires_at": "2026-01-01T00:10:00Z",
  "last_command_nonce": "example-v1-loop-001-command-001",
  "last_receipt_head_sha": "BUSINESS_HEAD_SHA",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

The runtime file is coordination metadata, not product configuration.

## Authorization Gate

The business repository should require a `control-authorization` check before
merge. The check reads the control repository with read-only credentials and
passes only when an unexpired authorization matches the current pull request
head and all required checks.

The Business Work Agent still revalidates the authorization immediately before
merge. The required check is enforcement, not a replacement for the role
protocol.

Copy the reference implementation from `business-kit/`. Configure
`CONTROL_REPOSITORY` in its workflow and add a read-only
`CONTROL_REPO_READ_TOKEN` Actions secret. Require the resulting
`Control Authorization` job in branch protection.

## Receipt Transport

A receipt may be stored as a PR comment, a check payload, or a file under
`.agent-loop/receipts/`. Whichever transport is selected must preserve the
exact JSON payload and make revisions distinguishable.

Do not include the authorization gate itself in the command's
`required_checks`; the gate validates the other required checks and would
otherwise wait on itself.
