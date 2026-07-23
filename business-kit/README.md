# Business Repository Kit

Copy the contents of this directory into the business repository.

1. Replace `OWNER/CONTROL_REPO` in
   `.github/workflows/control-authorization.yml`.
2. Add `CONTROL_REPO_READ_TOKEN` as an Actions secret. Give it read-only access
   to the control repository and no business-repository write permission.
3. Require the `Control Authorization / authorize` check in branch
   protection.
4. Keep the authorization workflow and gate script protected from ordinary
   autonomous implementation loops.
5. Run `node scripts/test-control-authorization-gate.mjs`.

The workflow uses `pull_request_target`, checks out only the trusted base SHA,
and never executes code from the pull-request head with the control token.
