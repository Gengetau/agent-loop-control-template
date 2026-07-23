#!/usr/bin/env node
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  printErrorsAndExit,
  readJsonFile,
  validateState
} from "./lib/protocol.mjs";

const statePath = resolve(process.argv[2] ?? "state/current.json");

if (!existsSync(statePath)) {
  console.error(`State file does not exist: ${statePath}`);
  process.exit(1);
}

let state;
try {
  state = readJsonFile(statePath);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const errors = validateState(state);
printErrorsAndExit(errors, "State validation");

console.log("State validation passed.");
console.log(JSON.stringify({
  schema_version: state.schema_version,
  program_id: state.program_id,
  major_version: state.major_version,
  status: state.status,
  exit_reason: state.exit_reason,
  current_loop: state.current_loop
}, null, 2));
