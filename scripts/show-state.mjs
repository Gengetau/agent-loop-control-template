#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const statePath = resolve("state/current.md");

if (!existsSync(statePath)) {
  console.error("state/current.md does not exist.");
  process.exit(1);
}

const content = readFileSync(statePath, "utf8");
const fields = {};

for (const line of content.split(/\r?\n/)) {
  const match = line.match(/^([a-z_]+):\s*(.+)$/);
  if (match) {
    fields[match[1]] = match[2];
  }
}

const requiredFields = [
  "project_name",
  "business_repo",
  "control_repo",
  "current_loop",
  "last_codex_report",
  "last_gpt_review",
  "status",
  "updated_at"
];

const missing = requiredFields.filter((field) => !(field in fields));

if (missing.length > 0) {
  console.error(`state/current.md is missing required fields: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(JSON.stringify(fields, null, 2));
