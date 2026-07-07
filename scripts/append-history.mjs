#!/usr/bin/env node
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const historyPath = resolve("state/history.jsonl");
const rawEvent = process.argv[2];

let event;

// The script accepts either a JSON object string or simple positional
// arguments. JSON is preferred because automation can preserve rich metadata.
if (rawEvent && rawEvent.trim().startsWith("{")) {
  try {
    event = JSON.parse(rawEvent);
  } catch (error) {
    console.error(`Could not parse JSON event: ${error.message}`);
    process.exit(1);
  }
} else {
  const eventType = process.argv[2] || "manual-event";
  const loopId = process.argv[3] || null;
  const actor = process.argv[4] || "unknown";
  event = {
    schema_version: 1,
    event_type: eventType,
    loop_id: loopId,
    actor
  };
}

if (!event.created_at) {
  event.created_at = new Date().toISOString();
}

if (!event.schema_version) {
  event.schema_version = 1;
}

// Ensure the state directory exists, then append a single JSON line. Appending
// preserves existing audit history and avoids destructive rewrites.
if (!existsSync(dirname(historyPath))) {
  mkdirSync(dirname(historyPath), { recursive: true });
}

appendFileSync(historyPath, `${JSON.stringify(event)}\n`, "utf8");

console.log(`Appended history event to ${historyPath}`);
