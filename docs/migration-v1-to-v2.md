# Migrate a v1 Control Repository to v2

## Breaking Changes

- Replace `state/current.md` with authoritative `state/current.json`.
- Replace the Codex/GPT role names with Business Work Agent and Control Work
  Agent.
- Stop letting the executor write reports to the control repository.
- Add machine commands, business receipts, control reviews, exact-head merge
  authorizations, and exit checkpoints.
- Replace manual browser handoff with long-running Work loops that poll GitHub.

## Migration Order

1. Freeze creation of new v1 loops.
2. Record the current control head, business head, active PR, current loop, and
   latest review.
3. Write and approve the current major-version charter.
4. Create `state/current.json` from `templates/current-state.json`.
5. Convert the active loop to schema version 2.
6. Create a matching command JSON and nonce.
7. Move historical execution reports and GPT reviews into an archive or leave
   them as immutable history.
8. Configure business-repository runtime state and authorization enforcement.
9. Run `npm test`.
10. Start the Control and Business long-running Work tasks from the durable
    checkpoint.

Do not maintain both Markdown and JSON current-state files after migration.
Two writable state authorities recreate the drift that schema v2 is designed
to eliminate.
