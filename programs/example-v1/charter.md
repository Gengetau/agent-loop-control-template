---
schema_version: 2
program_id: example-v1
project_name: Example Project
major_version: 1.0.0
status: approved
business_repo: OWNER/BUSINESS_REPO
control_repo: OWNER/CONTROL_REPO
approved_by: HUMAN_OWNER
approved_at: 2026-01-01T00:00:00Z
---
# Example Project v1 Charter

## Direction

Describe why this major version should exist and which user problem it solves.

## Expected Product Outcome

Describe the expected finished product in observable terms.

## In Scope

- The capabilities approved for autonomous delivery in this major version.

## Out of Scope

- Product directions that must wait for the next human planning session.

## Autonomous Version Policy

The Control Work Agent may create patch and minor implementation loops within
this charter. It may not expand the major-version direction or acceptance
criteria.

## Quality Gates

- Every business pull request passes the required CI checks.
- Every merge is bound to an unexpired exact-head authorization.
- Every deployment has a health check and rollback evidence.

## Merge and Deployment Policy

The Business Work Agent may merge only after validating a matching
`control-merge-authorization/v2` artifact. It may deploy and roll back within
the environments and procedures approved by this charter.

## Automatic Recovery Policy

On a normal failure, retry, diagnose, reduce scope, create a fix loop, use a
feature flag, or roll back before considering the program hard-blocked.

## Hard-Block Criteria

A program is hard-blocked only when the agents have recorded the failed
attempts and cannot proceed through a permitted retry, alternative
implementation, scope reduction, rollback, or deferred non-critical feature.

## Major-Version Completion Criteria

- All in-scope capabilities meet their acceptance criteria.
- CI, release, deployment, and rollback evidence are archived.
- No unresolved critical defect remains.
- A human-readable major-version acceptance package is ready.

## Human Acceptance

The human owner evaluates the expected product outcome, completion evidence,
known residual risks, and the produced artifact. Rejected acceptance creates a
new program amendment or follow-up loop.
