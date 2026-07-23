# Control Repository Agent Instructions

## Repository Role

Treat this repository as the authoritative control plane for one major-version
program. Product code belongs in the configured business repository.

## Required Workflow

1. Read `state/current.json` before choosing an action.
2. Read the referenced charter, loop, command, and optional artifacts.
3. Acquire `state/control-agent-lease.json` before writing protocol state.
4. Make one durable state transition at a time.
5. Run `npm test` before committing a protocol transition.
6. Update `state/current.json` only after its referenced artifacts exist.
7. Preserve exact repository, PR, head SHA, command nonce, receipt nonce, and
   review digest bindings.

## Boundaries

- Do not modify the business repository from a control-role run.
- Do not let the business role write this repository.
- Do not maintain a second writable current-state file.
- Do not authorize a branch name without an exact head SHA.
- Do not declare a hard block before exhausting charter-permitted recovery.
- Do not commit credentials, access tokens, or environment secrets.

## Exit

Every exit state requires a matching checkpoint. Quota exhaustion is
resumable; major-version readiness waits for human acceptance.
