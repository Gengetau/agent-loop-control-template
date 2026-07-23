# Optional Recovery Automation

The core protocol does not need n8n, a Workspace Agent API, or a sub-hour
Scheduled Task. The active ChatGPT Work runs perform their own wait-and-poll
loop.

Optional automation may:

- detect stale role leases;
- restart a resumable Work conversation at a supported cadence;
- notify the human when the program reaches an exit state;
- summarize multiple control repositories;
- retain external audit or incident copies.

Recovery automation must treat `state/current.json` and committed protocol
artifacts as authoritative. It must not invent state transitions or issue
merge authorizations.
