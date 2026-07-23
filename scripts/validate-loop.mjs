#!/usr/bin/env node
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  parseFrontmatterFile,
  printErrorsAndExit,
  validateLoop
} from "./lib/protocol.mjs";

const loopPath = resolve(process.argv[2] ?? "loops/loop-001-example.md");

if (!existsSync(loopPath)) {
  console.error(`Loop file does not exist: ${loopPath}`);
  process.exit(1);
}

let parsed;
try {
  parsed = parseFrontmatterFile(loopPath);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const errors = validateLoop(loopPath, parsed.metadata, parsed.content);
printErrorsAndExit(errors, "Loop validation");

console.log("Loop validation passed.");
console.log(JSON.stringify({
  schema_version: parsed.metadata.schema_version,
  program_id: parsed.metadata.program_id,
  loop_id: parsed.metadata.loop_id,
  status: parsed.metadata.status,
  target_version: parsed.metadata.target_version,
  target_business_repo: parsed.metadata.target_business_repo
}, null, 2));
