#!/usr/bin/env node
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  printErrorsAndExit,
  readJsonFile,
  validateState
} from "./lib/protocol.mjs";

const statePath = resolve("state/current.json");
if (!existsSync(statePath)) {
  console.error("state/current.json does not exist.");
  process.exit(1);
}

let state;
try {
  state = readJsonFile(statePath);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

printErrorsAndExit(validateState(state), "State validation");
console.log(JSON.stringify(state, null, 2));
