#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { basename, extname, normalize, resolve } from "node:path";

const allowedStatuses = new Set([
  "idle",
  "waiting-approval",
  "pending",
  "running",
  "waiting-review",
  "reviewed",
  "done",
  "blocked",
  "failed",
  "superseded"
]);

const requiredFields = [
  "schema_version",
  "loop_id",
  "title",
  "status",
  "risk_level",
  "execution_mode",
  "control_repo",
  "work_branch",
  "human_approval_required",
  "created_at",
  "created_by",
  "max_retry_count"
];

const loopPathArg = process.argv[2];

if (!loopPathArg) {
  console.error("Usage: node scripts/validate-loop.mjs <loop-file-path>");
  process.exit(1);
}

const loopPath = resolve(loopPathArg);

if (!existsSync(loopPath)) {
  console.error(`Loop file does not exist: ${loopPath}`);
  process.exit(1);
}

if (extname(loopPath) !== ".md") {
  console.error("Loop file must use the .md extension.");
  process.exit(1);
}

const content = readFileSync(loopPath, "utf8");

// The template uses simple YAML frontmatter. This parser intentionally handles
// only scalar values because loop metadata should stay simple and portable.
const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

if (!match) {
  console.error("Loop file is missing YAML frontmatter.");
  process.exit(1);
}

const metadata = {};

for (const line of match[1].split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    continue;
  }

  const separatorIndex = trimmed.indexOf(":");
  if (separatorIndex === -1) {
    console.error(`Invalid frontmatter line: ${line}`);
    process.exit(1);
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  const rawValue = trimmed.slice(separatorIndex + 1).trim();

  if (rawValue === "null") {
    metadata[key] = null;
  } else if (rawValue === "true") {
    metadata[key] = true;
  } else if (rawValue === "false") {
    metadata[key] = false;
  } else if (/^[0-9]+$/.test(rawValue)) {
    metadata[key] = Number(rawValue);
  } else {
    metadata[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

const errors = [];

for (const field of requiredFields) {
  if (!(field in metadata)) {
    errors.push(`Missing required field: ${field}`);
  }
}

if (metadata.loop_id && !/^loop-[0-9]{3}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.loop_id)) {
  errors.push("loop_id must match loop-001-example-task format.");
}

if (metadata.status && !allowedStatuses.has(metadata.status)) {
  errors.push(`Invalid status: ${metadata.status}`);
}

if (metadata.loop_id) {
  const expectedFilename = `${metadata.loop_id}.md`;
  const actualFilename = basename(loopPath);

  // The repository intentionally includes examples/example-loop.md because the
  // loop specification requires that example filename. Real workflow loop files
  // must still use the canonical <loop_id>.md name.
  const isDocumentedExampleAlias = normalize(loopPath).endsWith(normalize("examples/example-loop.md"));

  if (actualFilename !== expectedFilename && !isDocumentedExampleAlias) {
    errors.push(`Filename must be ${expectedFilename}, but found ${actualFilename}.`);
  }
}

if (errors.length > 0) {
  console.error("Loop validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Loop validation passed.");
console.log(JSON.stringify({
  loop_id: metadata.loop_id,
  status: metadata.status,
  title: metadata.title,
  filename: basename(loopPath),
  canonical_filename: `${metadata.loop_id}.md`
}, null, 2));
