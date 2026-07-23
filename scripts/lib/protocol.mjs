import {
  existsSync,
  readFileSync
} from "node:fs";
import {
  basename,
  extname,
  isAbsolute,
  relative,
  resolve,
  sep
} from "node:path";

export const ACTIVE_STATUSES = new Set([
  "dispatching",
  "business-executing",
  "ci-verifying",
  "control-reviewing",
  "changes-requested",
  "merge-authorized",
  "deploying",
  "advancing-version"
]);

export const EXIT_STATUS_REASONS = new Map([
  ["awaiting-human-acceptance", "major-version-ready"],
  ["hard-blocked", "hard-blocked"],
  ["quota-exhausted", "quota-exhausted"],
  ["stopped", "human-stop"]
]);

export const LOOP_STATUSES = new Set([
  "draft",
  "dispatched",
  "executing",
  "ready-for-review",
  "changes-requested",
  "authorized",
  "deployed",
  "completed",
  "superseded",
  "blocked"
]);

const LOOP_ID_PATTERN = /^loop-[0-9]{3}-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PROGRAM_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER_PATTERN = /^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?$/;

export function readJsonFile(path) {
  let value;
  try {
    value = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`Cannot parse JSON file ${path}: ${error.message}`);
  }
  return value;
}

export function resolveRepositoryPath(repositoryRoot, repositoryPath) {
  if (
    typeof repositoryPath !== "string" ||
    repositoryPath.length === 0 ||
    isAbsolute(repositoryPath)
  ) {
    throw new Error(`Expected a non-empty relative repository path, got: ${repositoryPath}`);
  }

  const target = resolve(repositoryRoot, repositoryPath);
  const relation = relative(repositoryRoot, target);
  if (relation === ".." || relation.startsWith(`..${sep}`) || isAbsolute(relation)) {
    throw new Error(`Repository path escapes the repository root: ${repositoryPath}`);
  }
  return target;
}

export function parseFrontmatterFile(path) {
  if (!existsSync(path)) {
    throw new Error(`File does not exist: ${path}`);
  }
  if (extname(path) !== ".md") {
    throw new Error(`Frontmatter file must use the .md extension: ${path}`);
  }

  const content = readFileSync(path, "utf8");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    throw new Error(`File is missing YAML frontmatter: ${path}`);
  }

  const metadata = {};
  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf(":");
    if (separatorIndex === -1) {
      throw new Error(`Invalid frontmatter line in ${path}: ${line}`);
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    metadata[key] = parseScalar(rawValue);
  }

  return { content, metadata };
}

function parseScalar(rawValue) {
  if (rawValue === "null") {
    return null;
  }
  if (rawValue === "true") {
    return true;
  }
  if (rawValue === "false") {
    return false;
  }
  if (/^-?[0-9]+$/.test(rawValue)) {
    return Number(rawValue);
  }
  return rawValue.replace(/^["']|["']$/g, "");
}

export function requireFields(value, fields, label, errors) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(`${label} must be an object.`);
    return;
  }
  for (const field of fields) {
    if (!(field in value)) {
      errors.push(`${label} is missing required field: ${field}`);
    }
  }
}

export function validateState(state) {
  const errors = [];
  requireFields(state, [
    "schema_version",
    "project_name",
    "program_id",
    "major_version",
    "business_repo",
    "control_repo",
    "charter_path",
    "current_loop",
    "current_command",
    "last_business_receipt",
    "last_control_review",
    "active_authorization",
    "exit_checkpoint",
    "control_lease",
    "status",
    "exit_reason",
    "cursor",
    "poll_interval_seconds",
    "updated_at"
  ], "state/current.json", errors);

  if (state.schema_version !== 2) {
    errors.push("state schema_version must be 2.");
  }
  if (!PROGRAM_ID_PATTERN.test(state.program_id ?? "")) {
    errors.push("state program_id must use lowercase letters, numbers, and hyphens.");
  }
  if (!SEMVER_PATTERN.test(state.major_version ?? "")) {
    errors.push("state major_version must be a semantic version such as 1.0.0.");
  }

  const isActive = ACTIVE_STATUSES.has(state.status);
  const expectedExitReason = EXIT_STATUS_REASONS.get(state.status);
  if (!isActive && !expectedExitReason) {
    errors.push(`Invalid global status: ${state.status}`);
  }
  if (isActive && state.exit_reason !== null) {
    errors.push("Active state must have exit_reason set to null.");
  }
  if (isActive && state.exit_checkpoint !== null) {
    errors.push("Active state must have exit_checkpoint set to null.");
  }
  if (expectedExitReason && state.exit_reason !== expectedExitReason) {
    errors.push(`Exit status ${state.status} requires exit_reason ${expectedExitReason}.`);
  }
  if (expectedExitReason && !state.exit_checkpoint) {
    errors.push(`Exit status ${state.status} requires exit_checkpoint.`);
  }

  if (
    !Number.isInteger(state.poll_interval_seconds) ||
    state.poll_interval_seconds < 60
  ) {
    errors.push("poll_interval_seconds must be an integer of at least 60.");
  }
  if (!isIsoTimestamp(state.updated_at)) {
    errors.push("state updated_at must be an ISO-8601 timestamp.");
  }

  requireFields(state.cursor, [
    "control_head",
    "business_head",
    "active_pull_request"
  ], "state cursor", errors);
  if (
    state.cursor?.active_pull_request !== null &&
    (!Number.isInteger(state.cursor.active_pull_request) ||
      state.cursor.active_pull_request < 1)
  ) {
    errors.push("cursor.active_pull_request must be null or a positive integer.");
  }

  return errors;
}

export function validateLoop(loopPath, metadata, content) {
  const errors = [];
  requireFields(metadata, [
    "schema_version",
    "program_id",
    "loop_id",
    "title",
    "status",
    "target_version",
    "target_business_repo",
    "target_branch",
    "control_repo",
    "command_path",
    "created_at",
    "created_by",
    "parent_loop_id",
    "attempt",
    "retry_count",
    "max_retry_count"
  ], `loop ${loopPath}`, errors);

  if (metadata.schema_version !== 2) {
    errors.push("loop schema_version must be 2.");
  }
  if (!PROGRAM_ID_PATTERN.test(metadata.program_id ?? "")) {
    errors.push("loop program_id must use lowercase letters, numbers, and hyphens.");
  }
  if (!LOOP_ID_PATTERN.test(metadata.loop_id ?? "")) {
    errors.push("loop_id must match loop-001-example format.");
  }
  if (!LOOP_STATUSES.has(metadata.status)) {
    errors.push(`Invalid loop status: ${metadata.status}`);
  }
  if (!SEMVER_PATTERN.test(metadata.target_version ?? "")) {
    errors.push("loop target_version must be a semantic version such as 1.0.1.");
  }
  if (metadata.command_path !== `commands/${metadata.loop_id}.json`) {
    errors.push("loop command_path must match commands/<loop_id>.json.");
  }
  if (
    metadata.parent_loop_id !== null &&
    !LOOP_ID_PATTERN.test(metadata.parent_loop_id ?? "")
  ) {
    errors.push("parent_loop_id must be null or match loop-001-example format.");
  }
  if (!Number.isInteger(metadata.attempt) || metadata.attempt < 1) {
    errors.push("attempt must be a positive integer.");
  }
  if (!Number.isInteger(metadata.retry_count) || metadata.retry_count < 0) {
    errors.push("retry_count must be a non-negative integer.");
  }
  if (
    !Number.isInteger(metadata.max_retry_count) ||
    metadata.max_retry_count < metadata.retry_count
  ) {
    errors.push("max_retry_count must be an integer not less than retry_count.");
  }
  if (!isIsoTimestamp(metadata.created_at)) {
    errors.push("loop created_at must be an ISO-8601 timestamp.");
  }
  if (basename(loopPath) !== `${metadata.loop_id}.md`) {
    errors.push(`Loop filename must be ${metadata.loop_id}.md.`);
  }

  for (const heading of [
    "Implementation Goal",
    "Allowed Changes",
    "Forbidden Changes",
    "Required Commands",
    "Required Outputs",
    "Acceptance Criteria",
    "Review Instructions"
  ]) {
    if (!content.includes(`## ${heading}`)) {
      errors.push(`Loop is missing section: ${heading}`);
    }
  }

  return errors;
}

export function validateCommand(command) {
  const errors = [];
  requireFields(command, [
    "schema",
    "program_id",
    "loop_id",
    "loop_path",
    "target_version",
    "target_business_repo",
    "base_branch",
    "work_branch",
    "expected_business_base_sha",
    "goal",
    "allowed_paths",
    "forbidden_paths",
    "required_checks",
    "acceptance_criteria",
    "receipt_contract",
    "issued_at",
    "nonce"
  ], "command", errors);

  if (command.schema !== "agent-loop-command/v2") {
    errors.push("command schema must be agent-loop-command/v2.");
  }
  if (!LOOP_ID_PATTERN.test(command.loop_id ?? "")) {
    errors.push("command loop_id is invalid.");
  }
  if (command.loop_path !== `loops/${command.loop_id}.md`) {
    errors.push("command loop_path must match loops/<loop_id>.md.");
  }
  if (command.receipt_contract !== "agent-loop-business-receipt/v2") {
    errors.push("command receipt_contract must be agent-loop-business-receipt/v2.");
  }
  if (!SEMVER_PATTERN.test(command.target_version ?? "")) {
    errors.push("command target_version must be a semantic version.");
  }
  for (const field of [
    "allowed_paths",
    "forbidden_paths",
    "required_checks",
    "acceptance_criteria"
  ]) {
    if (!Array.isArray(command[field])) {
      errors.push(`command ${field} must be an array.`);
    }
  }
  if (!isIsoTimestamp(command.issued_at)) {
    errors.push("command issued_at must be an ISO-8601 timestamp.");
  }
  if (typeof command.nonce !== "string" || command.nonce.length < 8) {
    errors.push("command nonce must be a non-trivial string.");
  }
  return errors;
}

export function isIsoTimestamp(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T/.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

export function printErrorsAndExit(errors, label) {
  if (errors.length === 0) {
    return;
  }
  console.error(`${label} failed:`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}
