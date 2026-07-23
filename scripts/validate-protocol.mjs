#!/usr/bin/env node
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  ACTIVE_STATUSES,
  EXIT_STATUS_REASONS,
  parseFrontmatterFile,
  printErrorsAndExit,
  readJsonFile,
  resolveRepositoryPath,
  validateCommand,
  validateLoop,
  validateState
} from "./lib/protocol.mjs";

const repositoryRoot = resolve(".");
const errors = [];

function loadReferencedJson(repositoryPath, label) {
  if (repositoryPath === null) {
    return null;
  }
  try {
    const path = resolveRepositoryPath(repositoryRoot, repositoryPath);
    if (!existsSync(path)) {
      errors.push(`${label} does not exist: ${repositoryPath}`);
      return null;
    }
    return readJsonFile(path);
  } catch (error) {
    errors.push(error.message);
    return null;
  }
}

const state = loadReferencedJson("state/current.json", "Current state");
if (!state) {
  printErrorsAndExit(errors, "Protocol validation");
  process.exit(1);
}
errors.push(...validateState(state));

let charter;
try {
  const charterPath = resolveRepositoryPath(repositoryRoot, state.charter_path);
  charter = parseFrontmatterFile(charterPath);
  const requiredCharterFields = [
    "schema_version",
    "program_id",
    "project_name",
    "major_version",
    "status",
    "business_repo",
    "control_repo",
    "approved_by",
    "approved_at"
  ];
  for (const field of requiredCharterFields) {
    if (!(field in charter.metadata)) {
      errors.push(`Charter is missing required field: ${field}`);
    }
  }
  if (charter.metadata.schema_version !== 2) {
    errors.push("Charter schema_version must be 2.");
  }
  if (charter.metadata.status !== "approved") {
    errors.push("Current charter must have status approved.");
  }
  for (const heading of [
    "Direction",
    "Expected Product Outcome",
    "In Scope",
    "Out of Scope",
    "Autonomous Version Policy",
    "Quality Gates",
    "Merge and Deployment Policy",
    "Automatic Recovery Policy",
    "Hard-Block Criteria",
    "Major-Version Completion Criteria",
    "Human Acceptance"
  ]) {
    if (!charter.content.includes(`## ${heading}`)) {
      errors.push(`Charter is missing section: ${heading}`);
    }
  }
} catch (error) {
  errors.push(error.message);
}

let loop;
try {
  const loopPath = resolveRepositoryPath(repositoryRoot, state.current_loop);
  loop = parseFrontmatterFile(loopPath);
  errors.push(...validateLoop(loopPath, loop.metadata, loop.content));
} catch (error) {
  errors.push(error.message);
}

const command = loadReferencedJson(state.current_command, "Current command");
if (command) {
  errors.push(...validateCommand(command));
}

if (charter) {
  for (const field of [
    "program_id",
    "major_version",
    "business_repo",
    "control_repo"
  ]) {
    if (state[field] !== charter.metadata[field]) {
      errors.push(`State ${field} does not match charter ${field}.`);
    }
  }
}

if (loop) {
  if (state.program_id !== loop.metadata.program_id) {
    errors.push("State program_id does not match loop program_id.");
  }
  if (state.business_repo !== loop.metadata.target_business_repo) {
    errors.push("State business_repo does not match loop target_business_repo.");
  }
  if (state.control_repo !== loop.metadata.control_repo) {
    errors.push("State control_repo does not match loop control_repo.");
  }
  if (state.current_command !== loop.metadata.command_path) {
    errors.push("State current_command does not match loop command_path.");
  }
}

if (command && loop) {
  const pairs = [
    ["program_id", command.program_id, loop.metadata.program_id],
    ["loop_id", command.loop_id, loop.metadata.loop_id],
    ["target_version", command.target_version, loop.metadata.target_version],
    ["target_business_repo", command.target_business_repo, loop.metadata.target_business_repo],
    ["work_branch", command.work_branch, loop.metadata.target_branch],
    ["loop_path", command.loop_path, state.current_loop]
  ];
  for (const [field, left, right] of pairs) {
    if (left !== right) {
      errors.push(`Command ${field} does not match the current loop or state.`);
    }
  }
}

const receipt = loadReferencedJson(
  state.last_business_receipt,
  "Last business receipt"
);
if (receipt) {
  for (const field of [
    "schema",
    "program_id",
    "loop_id",
    "command_nonce",
    "business_repo",
    "base_sha",
    "head_sha",
    "pull_request",
    "work_branch",
    "execution_status",
    "changed_files",
    "commands",
    "checks",
    "deployment",
    "known_risks",
    "emitted_at",
    "receipt_nonce"
  ]) {
    if (!(field in receipt)) {
      errors.push(`Business receipt is missing required field: ${field}`);
    }
  }
  if (receipt.schema !== "agent-loop-business-receipt/v2") {
    errors.push("Business receipt schema is invalid.");
  }
  if (receipt.program_id !== state.program_id || receipt.loop_id !== command?.loop_id) {
    errors.push("Business receipt does not match the current program and loop.");
  }
  if (receipt.command_nonce !== command?.nonce) {
    errors.push("Business receipt command_nonce does not match the current command.");
  }
  if (receipt.business_repo !== state.business_repo) {
    errors.push("Business receipt repository does not match state.");
  }
  if (receipt.base_sha !== command?.expected_business_base_sha) {
    errors.push("Business receipt base SHA does not match the command.");
  }
  if (receipt.work_branch !== command?.work_branch) {
    errors.push("Business receipt work branch does not match the command.");
  }
  if (!Number.isInteger(receipt.pull_request) || receipt.pull_request < 1) {
    errors.push("Business receipt pull_request must be a positive integer.");
  }
  if (!Array.isArray(receipt.changed_files) || !Array.isArray(receipt.checks)) {
    errors.push("Business receipt changed_files and checks must be arrays.");
  }
  if (!["ready-for-control-review", "merged", "deployed", "rolled-back"].includes(receipt.execution_status)) {
    errors.push("Business receipt execution_status is invalid.");
  }
  for (const requiredCheck of command?.required_checks ?? []) {
    const check = receipt.checks?.find((candidate) => candidate.name === requiredCheck);
    if (!check) {
      errors.push(`Business receipt is missing required check: ${requiredCheck}`);
    } else {
      if (check.status !== "success") {
        errors.push(`Required check ${requiredCheck} is not successful.`);
      }
      if (check.head_sha !== receipt.head_sha) {
        errors.push(`Required check ${requiredCheck} is not bound to the receipt head.`);
      }
    }
  }
}

const review = loadReferencedJson(state.last_control_review, "Last control review");
if (review) {
  for (const field of [
    "schema",
    "program_id",
    "loop_id",
    "command_nonce",
    "receipt_nonce",
    "business_repo",
    "pull_request",
    "reviewed_head_sha",
    "verdict",
    "acceptance_results",
    "required_fixes",
    "risks",
    "reviewed_at",
    "review_digest"
  ]) {
    if (!(field in review)) {
      errors.push(`Control review is missing required field: ${field}`);
    }
  }
  if (review.schema !== "control-review/v2") {
    errors.push("Control review schema is invalid.");
  }
  if (review.receipt_nonce !== receipt?.receipt_nonce) {
    errors.push("Control review receipt_nonce does not match the archived receipt.");
  }
  if (review.reviewed_head_sha !== receipt?.head_sha) {
    errors.push("Control review head SHA does not match the business receipt.");
  }
  if (review.command_nonce !== command?.nonce) {
    errors.push("Control review command_nonce does not match the command.");
  }
  if (review.business_repo !== state.business_repo) {
    errors.push("Control review repository does not match state.");
  }
  if (review.pull_request !== receipt?.pull_request) {
    errors.push("Control review pull request does not match the receipt.");
  }
  if (!["accepted", "changes-requested", "blocked", "rejected", "superseded"].includes(review.verdict)) {
    errors.push("Control review verdict is invalid.");
  }
  if (
    typeof review.review_digest !== "string" ||
    !review.review_digest.startsWith("sha256:")
  ) {
    errors.push("Control review digest must use the sha256: prefix.");
  }
}

const authorization = loadReferencedJson(
  state.active_authorization,
  "Active authorization"
);
if (authorization) {
  for (const field of [
    "schema",
    "program_id",
    "loop_id",
    "command_nonce",
    "receipt_nonce",
    "business_repo",
    "pull_request",
    "head_sha",
    "decision",
    "required_checks",
    "review_digest",
    "authorization_nonce",
    "issued_at",
    "expires_at",
    "consumed_by_merge_sha"
  ]) {
    if (!(field in authorization)) {
      errors.push(`Merge authorization is missing required field: ${field}`);
    }
  }
  if (authorization.schema !== "control-merge-authorization/v2") {
    errors.push("Merge authorization schema is invalid.");
  }
  if (authorization.decision !== "approve-merge") {
    errors.push("Active authorization decision must be approve-merge.");
  }
  if (authorization.head_sha !== receipt?.head_sha) {
    errors.push("Merge authorization head SHA does not match the receipt.");
  }
  if (authorization.review_digest !== review?.review_digest) {
    errors.push("Merge authorization review_digest does not match the review.");
  }
  if (authorization.command_nonce !== command?.nonce) {
    errors.push("Merge authorization command_nonce does not match the command.");
  }
  if (authorization.receipt_nonce !== receipt?.receipt_nonce) {
    errors.push("Merge authorization receipt_nonce does not match the receipt.");
  }
  if (authorization.business_repo !== state.business_repo) {
    errors.push("Merge authorization repository does not match state.");
  }
  if (authorization.pull_request !== receipt?.pull_request) {
    errors.push("Merge authorization pull request does not match the receipt.");
  }
  if (review?.verdict !== "accepted") {
    errors.push("Merge authorization requires an accepted control review.");
  }
  if (
    JSON.stringify([...(authorization.required_checks ?? [])].sort()) !==
    JSON.stringify([...(command?.required_checks ?? [])].sort())
  ) {
    errors.push("Merge authorization required_checks do not match the command.");
  }
  if (authorization.consumed_by_merge_sha !== null) {
    errors.push("Active authorization must not already be consumed.");
  }
  if (Date.parse(authorization.expires_at) <= Date.parse(authorization.issued_at)) {
    errors.push("Merge authorization must expire after it is issued.");
  }
  if (
    state.cursor?.business_head !== receipt?.head_sha ||
    state.cursor?.active_pull_request !== receipt?.pull_request
  ) {
    errors.push("Authorized state cursor must match the receipt head and pull request.");
  }
}

const checkpoint = loadReferencedJson(state.exit_checkpoint, "Exit checkpoint");
if (checkpoint) {
  for (const field of [
    "schema",
    "program_id",
    "loop_id",
    "exit_reason",
    "resumable",
    "resume_status",
    "control_head",
    "business_head",
    "active_pull_request",
    "last_command_nonce",
    "last_receipt_nonce",
    "attempts",
    "next_safe_action",
    "created_at"
  ]) {
    if (!(field in checkpoint)) {
      errors.push(`Exit checkpoint is missing required field: ${field}`);
    }
  }
  if (checkpoint.schema !== "agent-loop-exit-checkpoint/v2") {
    errors.push("Exit checkpoint schema is invalid.");
  }
  if (checkpoint.program_id !== state.program_id) {
    errors.push("Exit checkpoint program_id does not match state.");
  }
  if (checkpoint.exit_reason !== state.exit_reason) {
    errors.push("Exit checkpoint reason does not match state exit_reason.");
  }
  if (checkpoint.loop_id !== command?.loop_id) {
    errors.push("Exit checkpoint loop_id does not match the current command.");
  }
  if (checkpoint.last_command_nonce !== command?.nonce) {
    errors.push("Exit checkpoint command nonce does not match the command.");
  }
  if (
    checkpoint.exit_reason === "quota-exhausted" &&
    checkpoint.resumable !== true
  ) {
    errors.push("Quota exhaustion checkpoint must be resumable.");
  }
}

const controlLease = loadReferencedJson(state.control_lease, "Control agent lease");
if (controlLease) {
  const leaseFields = [
    "schema",
    "role",
    "program_id",
    "loop_id",
    "status",
    "run_id",
    "claimed_transition",
    "acquired_at",
    "expires_at",
    "predecessor_run_id",
    "updated_at"
  ];
  for (const field of leaseFields) {
    if (!(field in controlLease)) {
      errors.push(`Control agent lease is missing required field: ${field}`);
    }
  }
  if (controlLease.schema !== "agent-loop-role-lease/v2") {
    errors.push("Control agent lease schema is invalid.");
  }
  if (controlLease.role !== "control-work-agent") {
    errors.push("Control agent lease role must be control-work-agent.");
  }
  if (controlLease.program_id !== state.program_id) {
    errors.push("Control agent lease program_id does not match state.");
  }
  if (controlLease.loop_id !== command?.loop_id) {
    errors.push("Control agent lease loop_id does not match the current command.");
  }
  if (!["held", "released"].includes(controlLease.status)) {
    errors.push("Control agent lease status must be held or released.");
  }
  if (
    controlLease.status === "released" &&
    [
      controlLease.run_id,
      controlLease.claimed_transition,
      controlLease.acquired_at,
      controlLease.expires_at
    ].some((value) => value !== null)
  ) {
    errors.push("Released control agent lease must clear ownership fields.");
  }
  if (controlLease.status === "held") {
    if (
      typeof controlLease.run_id !== "string" ||
      typeof controlLease.claimed_transition !== "string"
    ) {
      errors.push("Held control agent lease requires run_id and claimed_transition.");
    }
    if (
      !Number.isFinite(Date.parse(controlLease.acquired_at)) ||
      !Number.isFinite(Date.parse(controlLease.expires_at)) ||
      Date.parse(controlLease.expires_at) <= Date.parse(controlLease.acquired_at)
    ) {
      errors.push("Held control agent lease requires a valid future expiry.");
    }
  }
}

if (
  ["control-reviewing", "changes-requested", "merge-authorized", "deploying"]
    .includes(state.status) &&
  !receipt
) {
  errors.push(`State ${state.status} requires a business receipt.`);
}
if (["changes-requested", "merge-authorized", "deploying"].includes(state.status) && !review) {
  errors.push(`State ${state.status} requires a control review.`);
}
if (state.status === "changes-requested" && review?.verdict !== "changes-requested") {
  errors.push("changes-requested state requires a changes-requested review.");
}
if (["merge-authorized", "deploying"].includes(state.status) && !authorization) {
  errors.push(`State ${state.status} requires an active authorization.`);
}
if (ACTIVE_STATUSES.has(state.status) && checkpoint) {
  errors.push("Active protocol state cannot reference an exit checkpoint.");
}
if (EXIT_STATUS_REASONS.has(state.status) && !checkpoint) {
  errors.push(`Exit status ${state.status} requires a checkpoint.`);
}

for (const templatePath of [
  "templates/current-state.json",
  "templates/command.json",
  "templates/business-receipt.json",
  "templates/control-review.json",
  "templates/merge-authorization.json",
  "templates/exit-checkpoint.json",
  "templates/control-agent-lease.json",
  "examples/example-business-receipt.json",
  "examples/example-control-review.json",
  "examples/example-merge-authorization.json",
  "examples/example-exit-checkpoint.json"
]) {
  try {
    readJsonFile(resolveRepositoryPath(repositoryRoot, templatePath));
  } catch (error) {
    errors.push(error.message);
  }
}

const exampleReceipt = readJsonFile(resolve(repositoryRoot, "examples/example-business-receipt.json"));
const exampleReview = readJsonFile(resolve(repositoryRoot, "examples/example-control-review.json"));
const exampleAuthorization = readJsonFile(resolve(repositoryRoot, "examples/example-merge-authorization.json"));
if (exampleReview.receipt_nonce !== exampleReceipt.receipt_nonce) {
  errors.push("Example review does not reference the example receipt.");
}
if (exampleReview.reviewed_head_sha !== exampleReceipt.head_sha) {
  errors.push("Example review head does not match the example receipt.");
}
if (exampleAuthorization.review_digest !== exampleReview.review_digest) {
  errors.push("Example authorization does not reference the example review digest.");
}
if (exampleAuthorization.head_sha !== exampleReceipt.head_sha) {
  errors.push("Example authorization head does not match the example receipt.");
}

printErrorsAndExit(errors, "Protocol validation");
console.log("Protocol validation passed.");
console.log(JSON.stringify({
  program_id: state.program_id,
  major_version: state.major_version,
  status: state.status,
  loop_id: command?.loop_id,
  command_nonce: command?.nonce,
  optional_artifacts: {
    receipt: Boolean(receipt),
    review: Boolean(review),
    authorization: Boolean(authorization),
    checkpoint: Boolean(checkpoint)
  }
}, null, 2));
