# Work-Native Dual-Agent Control Template

This repository is the durable control plane for two autonomous ChatGPT Work
agents operating against one software project.

- The **Control Work Agent** writes only to this control repository and reads
  the business repository.
- The **Business Work Agent** writes only to the business repository and reads
  this control repository.
- A **human owner** approves the major-version charter and accepts the finished
  major version.

The repositories are the agents' shared fact layer. The agents do not need a
direct messaging channel, a Workspace Agent API, or an external job queue.

## Operating Model

One long-running Work task is started for each role. While active, each task
repeats this loop:

1. Read its writable repository and the other repository.
2. Acquire or confirm its role lease.
3. Perform every currently actionable transition.
4. Commit a durable checkpoint after each transition.
5. When waiting for the other role, wait for the configured poll interval and
   inspect GitHub again.
6. Exit only when the major version is ready for human acceptance, the project
   is provably hard-blocked, the account quota is exhausted, or the human
   explicitly stops the run.

The native Scheduled Task is an optional recovery heartbeat. It is not the
normal coordination mechanism.

## Authority Boundaries

| Actor | Writes | Reads | Authority |
| --- | --- | --- | --- |
| Human owner | Major-version charter and acceptance decision | Both repositories | Direction, expected outcome, major acceptance |
| Control Work Agent | Control repository | Both repositories | Decomposition, review, merge authorization, next-loop planning |
| Business Work Agent | Business repository | Both repositories | Implementation, tests, PRs, fixes, merge, deploy, rollback |

The Business Work Agent cannot authorize its own merge. The Control Work Agent
cannot modify product code. A merge authorization is valid only for the exact
business repository, pull request, head SHA, checks, review digest, nonce, and
expiry recorded in the authorization artifact.

## Quick Start

```bash
git clone https://github.com/Gengetau/agent-loop-control-template.git
cd agent-loop-control-template
cp config/project.example.json config/project.json
npm test
npm run show:state
```

Replace every `OWNER/...`, `Example Project`, and example version value before
starting a real program.

## Initialize a Major Version

1. Copy `templates/program-charter.md` to
   `programs/<program_id>/charter.md`.
2. Complete the direction, scope, expected artifact, CI/CD policy, rollback
   policy, autonomous version policy, hard-block rules, and human acceptance
   criteria.
3. Copy `templates/loop.md` and `templates/command.json` for the first small
   version.
4. Copy `templates/current-state.json` to `state/current.json` and point it at
   the charter, loop, and command.
5. Run `npm test`.
6. Install `skills/control-work-governor` in the control account and
   `skills/business-work-executor` in the business account.
7. Start one long-running Work chat for each role and invoke its installed
   Skill.

## Durable Artifacts

- `programs/`: human-approved major-version charters.
- `project/`: durable product and architecture context.
- `state/current.json`: the authoritative global program state.
- `state/control-agent-lease.json`: the control role's overlap-prevention lease.
- `loops/`: human-readable small-version and fix specifications.
- `commands/`: machine-readable dispatch artifacts.
- `receipts/business/`: copies of business-repository execution receipts
  archived by the Control Work Agent.
- `reviews/control-agent/`: structured control reviews.
- `authorizations/`: exact-SHA merge authorizations.
- `checkpoints/`: resumable exit and recovery snapshots.
- `incidents/`: hard-block and rollback evidence.
- `skills/`: installable connector-first Skills for both Work roles.
- `templates/`: copyable protocol artifacts.
- `examples/`: complete example artifacts.

The control repository remains the durable project brain rather than a generic
job queue. Commands, receipts, reviews, and authorizations are committed
protocol facts attached to a major-version program.

## Validation

The validators have no third-party dependencies:

```bash
npm run validate:loop
npm run validate:state
npm run validate:protocol
npm test
```

`validate:protocol` checks the current state, referenced charter, current loop,
machine command, optional receipt, review, authorization, and exit checkpoint
as one consistent snapshot.

See `docs/dual-agent-protocol.md` for the state machine and
`docs/migration-v1-to-v2.md` when upgrading an existing control repository.
