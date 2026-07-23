#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

function required(value, fields, label, errors) {
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

function requiredStringArray(value, label, errors) {
  if (
    !Array.isArray(value) ||
    value.some((entry) => typeof entry !== "string" || entry.length === 0)
  ) {
    errors.push(`${label} must be an array of non-empty strings.`);
    return [];
  }
  if (new Set(value).size !== value.length) {
    errors.push(`${label} must not contain duplicates.`);
  }
  return value;
}

function requiredCheckArray(value, label, errors) {
  if (
    !Array.isArray(value) ||
    value.some(
      (entry) =>
        !entry ||
        typeof entry !== "object" ||
        typeof entry.name !== "string" ||
        typeof entry.status !== "string" ||
        typeof entry.head_sha !== "string"
    )
  ) {
    errors.push(`${label} must be an array of named check results.`);
    return [];
  }
  return value;
}

export function validateAuthorizationContext(context) {
  const errors = [];
  required(context, [
    "control_state",
    "command",
    "receipt",
    "review",
    "authorization",
    "business",
    "now"
  ], "context", errors);

  const state = context?.control_state;
  const command = context?.command;
  const receipt = context?.receipt;
  const review = context?.review;
  const authorization = context?.authorization;
  const business = context?.business;

  required(state, [
    "program_id",
    "business_repo",
    "status",
    "current_command",
    "last_business_receipt",
    "last_control_review",
    "active_authorization"
  ], "control_state", errors);
  required(command, [
    "schema",
    "program_id",
    "loop_id",
    "target_business_repo",
    "required_checks",
    "nonce"
  ], "command", errors);
  required(receipt, [
    "schema",
    "program_id",
    "loop_id",
    "command_nonce",
    "business_repo",
    "head_sha",
    "pull_request",
    "checks",
    "receipt_nonce"
  ], "receipt", errors);
  required(review, [
    "schema",
    "command_nonce",
    "receipt_nonce",
    "business_repo",
    "pull_request",
    "reviewed_head_sha",
    "verdict",
    "review_digest"
  ], "review", errors);
  required(authorization, [
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
  ], "authorization", errors);
  required(business, [
    "repository",
    "pull_request",
    "head_sha",
    "checks"
  ], "business", errors);

  if (state?.status !== "merge-authorized") {
    errors.push("Control state is not merge-authorized.");
  }
  if (command?.schema !== "agent-loop-command/v2") {
    errors.push("Command schema is invalid.");
  }
  if (receipt?.schema !== "agent-loop-business-receipt/v2") {
    errors.push("Receipt schema is invalid.");
  }
  if (review?.schema !== "control-review/v2" || review?.verdict !== "accepted") {
    errors.push("An accepted control-review/v2 artifact is required.");
  }
  if (
    authorization?.schema !== "control-merge-authorization/v2" ||
    authorization?.decision !== "approve-merge"
  ) {
    errors.push("An approve-merge control authorization is required.");
  }

  const equalities = [
    ["state program", state?.program_id, command?.program_id],
    ["receipt program", receipt?.program_id, command?.program_id],
    ["authorization program", authorization?.program_id, command?.program_id],
    ["receipt loop", receipt?.loop_id, command?.loop_id],
    ["authorization loop", authorization?.loop_id, command?.loop_id],
    ["business repository", business?.repository, command?.target_business_repo],
    ["state repository", state?.business_repo, business?.repository],
    ["receipt repository", receipt?.business_repo, business?.repository],
    ["review repository", review?.business_repo, business?.repository],
    ["authorization repository", authorization?.business_repo, business?.repository],
    ["receipt command nonce", receipt?.command_nonce, command?.nonce],
    ["review command nonce", review?.command_nonce, command?.nonce],
    ["authorization command nonce", authorization?.command_nonce, command?.nonce],
    ["review receipt nonce", review?.receipt_nonce, receipt?.receipt_nonce],
    ["authorization receipt nonce", authorization?.receipt_nonce, receipt?.receipt_nonce],
    ["receipt PR", receipt?.pull_request, business?.pull_request],
    ["review PR", review?.pull_request, business?.pull_request],
    ["authorization PR", authorization?.pull_request, business?.pull_request],
    ["receipt head", receipt?.head_sha, business?.head_sha],
    ["reviewed head", review?.reviewed_head_sha, business?.head_sha],
    ["authorized head", authorization?.head_sha, business?.head_sha],
    ["review digest", authorization?.review_digest, review?.review_digest]
  ];
  for (const [label, actual, expected] of equalities) {
    if (actual !== expected) {
      errors.push(`${label} does not match.`);
    }
  }

  const expectedChecks = requiredStringArray(
    command?.required_checks,
    "Command required_checks",
    errors
  ).toSorted();
  const authorizedChecks = requiredStringArray(
    authorization?.required_checks,
    "Authorization required_checks",
    errors
  ).toSorted();
  const receiptChecks = requiredCheckArray(
    receipt?.checks,
    "Receipt checks",
    errors
  );
  const liveChecks = requiredCheckArray(
    business?.checks,
    "Live checks",
    errors
  );
  if (JSON.stringify(expectedChecks) !== JSON.stringify(authorizedChecks)) {
    errors.push("Authorization required checks do not match the command.");
  }

  for (const name of expectedChecks) {
    const receiptCheck = receiptChecks.find((check) => check.name === name);
    const liveCheck = liveChecks.find((check) => check.name === name);
    if (
      !receiptCheck ||
      receiptCheck.status !== "success" ||
      receiptCheck.head_sha !== business?.head_sha
    ) {
      errors.push(`Receipt check ${name} is missing, unsuccessful, or stale.`);
    }
    if (
      !liveCheck ||
      liveCheck.status !== "success" ||
      liveCheck.head_sha !== business?.head_sha
    ) {
      errors.push(`Live check ${name} is missing, unsuccessful, or stale.`);
    }
  }

  const now = Date.parse(context?.now);
  const issuedAt = Date.parse(authorization?.issued_at);
  const expiresAt = Date.parse(authorization?.expires_at);
  if (!Number.isFinite(now)) {
    errors.push("Context now must be an ISO timestamp.");
  }
  if (!Number.isFinite(issuedAt) || issuedAt > now) {
    errors.push("Authorization is not yet valid.");
  }
  if (!Number.isFinite(expiresAt) || expiresAt <= now) {
    errors.push("Authorization is expired.");
  }
  if (
    Number.isFinite(issuedAt) &&
    Number.isFinite(expiresAt) &&
    expiresAt <= issuedAt
  ) {
    errors.push("Authorization expiry must be later than its issue time.");
  }
  if (authorization?.consumed_by_merge_sha !== null) {
    errors.push("Authorization has already been consumed.");
  }

  return {
    ok: errors.length === 0,
    errors,
    authorization_nonce: authorization?.authorization_nonce ?? null,
    head_sha: business?.head_sha ?? null
  };
}

function runCli() {
  const contextPath = process.argv[2];
  if (!contextPath) {
    console.error("Usage: node control-authorization-gate.mjs <context.json>");
    process.exit(2);
  }

  let context;
  try {
    context = JSON.parse(readFileSync(contextPath, "utf8"));
  } catch (error) {
    console.error(`Cannot read authorization context: ${error.message}`);
    process.exit(2);
  }

  const result = validateAuthorizationContext(context);
  if (!result.ok) {
    console.error("Control authorization rejected:");
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(JSON.stringify(result, null, 2));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli();
}
