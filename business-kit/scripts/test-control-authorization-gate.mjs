#!/usr/bin/env node
import assert from "node:assert/strict";
import { validateAuthorizationContext } from "./control-authorization-gate.mjs";

function validContext() {
  const repository = "OWNER/BUSINESS_REPO";
  const head = "BUSINESS_HEAD_SHA";
  const commandNonce = "command-nonce-001";
  const receiptNonce = "receipt-nonce-001";
  const reviewDigest = "sha256:review-digest";
  return {
    now: "2026-01-01T00:30:00Z",
    control_state: {
      program_id: "example-v1",
      business_repo: repository,
      status: "merge-authorized",
      current_command: "commands/loop-001-example.json",
      last_business_receipt: "receipts/business/loop-001-example.json",
      last_control_review: "reviews/control-agent/loop-001-example.json",
      active_authorization: "authorizations/loop-001-example.json"
    },
    command: {
      schema: "agent-loop-command/v2",
      program_id: "example-v1",
      loop_id: "loop-001-example",
      target_business_repo: repository,
      required_checks: ["CI"],
      nonce: commandNonce
    },
    receipt: {
      schema: "agent-loop-business-receipt/v2",
      program_id: "example-v1",
      loop_id: "loop-001-example",
      command_nonce: commandNonce,
      business_repo: repository,
      head_sha: head,
      pull_request: 1,
      checks: [{ name: "CI", status: "success", head_sha: head }],
      receipt_nonce: receiptNonce
    },
    review: {
      schema: "control-review/v2",
      command_nonce: commandNonce,
      receipt_nonce: receiptNonce,
      business_repo: repository,
      pull_request: 1,
      reviewed_head_sha: head,
      verdict: "accepted",
      review_digest: reviewDigest
    },
    authorization: {
      schema: "control-merge-authorization/v2",
      program_id: "example-v1",
      loop_id: "loop-001-example",
      command_nonce: commandNonce,
      receipt_nonce: receiptNonce,
      business_repo: repository,
      pull_request: 1,
      head_sha: head,
      decision: "approve-merge",
      required_checks: ["CI"],
      review_digest: reviewDigest,
      authorization_nonce: "authorization-nonce-001",
      issued_at: "2026-01-01T00:20:00Z",
      expires_at: "2026-01-01T01:20:00Z",
      consumed_by_merge_sha: null
    },
    business: {
      repository,
      pull_request: 1,
      head_sha: head,
      checks: [{ name: "CI", status: "success", head_sha: head }]
    }
  };
}

const valid = validateAuthorizationContext(validContext());
assert.equal(valid.ok, true, valid.errors.join("\n"));

const changedHead = validContext();
changedHead.business.head_sha = "NEW_HEAD_SHA";
assert.equal(validateAuthorizationContext(changedHead).ok, false);

const expired = validContext();
expired.now = "2026-01-01T02:00:00Z";
assert.equal(validateAuthorizationContext(expired).ok, false);

const futureIssued = validContext();
futureIssued.authorization.issued_at = "2026-01-01T00:40:00Z";
assert.equal(validateAuthorizationContext(futureIssued).ok, false);

const missingCheck = validContext();
missingCheck.business.checks = [];
assert.equal(validateAuthorizationContext(missingCheck).ok, false);

const duplicateCheck = validContext();
duplicateCheck.command.required_checks = ["CI", "CI"];
assert.equal(validateAuthorizationContext(duplicateCheck).ok, false);

const consumed = validContext();
consumed.authorization.consumed_by_merge_sha = "MERGE_SHA";
assert.equal(validateAuthorizationContext(consumed).ok, false);

assert.doesNotThrow(() => validateAuthorizationContext(null));
assert.equal(validateAuthorizationContext(null).ok, false);

console.log("Business authorization gate tests passed.");
