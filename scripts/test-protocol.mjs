#!/usr/bin/env node
import {
  cpSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const sourceRoot = resolve(".");
const fixtureRoot = mkdtempSync(join(tmpdir(), "agent-loop-protocol-"));

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function runValidator(expectSuccess, expectedText) {
  const result = spawnSync(
    process.execPath,
    ["scripts/validate-protocol.mjs"],
    {
      cwd: fixtureRoot,
      encoding: "utf8"
    }
  );
  const output = `${result.stdout}\n${result.stderr}`;
  if (expectSuccess && result.status !== 0) {
    throw new Error(`Expected protocol validation to pass.\n${output}`);
  }
  if (!expectSuccess && result.status === 0) {
    throw new Error(`Expected protocol validation to fail.\n${output}`);
  }
  if (expectedText && !output.includes(expectedText)) {
    throw new Error(`Expected output to include "${expectedText}".\n${output}`);
  }
}

try {
  cpSync(sourceRoot, fixtureRoot, {
    recursive: true,
    filter: (source) => !source.includes(`${join(sourceRoot, ".git")}`)
  });

  runValidator(true, "Protocol validation passed.");

  const statePath = join(fixtureRoot, "state/current.json");
  const originalState = readJson(statePath);

  const missingReceiptState = {
    ...originalState,
    status: "control-reviewing"
  };
  writeJson(statePath, missingReceiptState);
  runValidator(false, "requires a business receipt");

  mkdirSync(join(fixtureRoot, "receipts/business"), { recursive: true });
  mkdirSync(join(fixtureRoot, "reviews/control-agent"), { recursive: true });
  mkdirSync(join(fixtureRoot, "authorizations"), { recursive: true });
  cpSync(
    join(fixtureRoot, "examples/example-business-receipt.json"),
    join(fixtureRoot, "receipts/business/loop-001-example.json")
  );
  cpSync(
    join(fixtureRoot, "examples/example-control-review.json"),
    join(fixtureRoot, "reviews/control-agent/loop-001-example.json")
  );
  cpSync(
    join(fixtureRoot, "examples/example-merge-authorization.json"),
    join(fixtureRoot, "authorizations/loop-001-example.json")
  );

  const authorizedState = {
    ...originalState,
    status: "merge-authorized",
    last_business_receipt: "receipts/business/loop-001-example.json",
    last_control_review: "reviews/control-agent/loop-001-example.json",
    active_authorization: "authorizations/loop-001-example.json",
    cursor: {
      ...originalState.cursor,
      business_head: "BUSINESS_HEAD_SHA",
      active_pull_request: 1
    }
  };
  writeJson(statePath, authorizedState);
  runValidator(true, "Protocol validation passed.");

  const authorizationPath = join(
    fixtureRoot,
    "authorizations/loop-001-example.json"
  );
  const mismatchedAuthorization = {
    ...readJson(authorizationPath),
    head_sha: "DIFFERENT_HEAD_SHA"
  };
  writeJson(authorizationPath, mismatchedAuthorization);
  runValidator(false, "head SHA does not match the receipt");

  writeJson(statePath, {
    ...originalState,
    status: "quota-exhausted",
    exit_reason: "quota-exhausted",
    exit_checkpoint: null
  });
  runValidator(false, "requires exit_checkpoint");

  mkdirSync(join(fixtureRoot, "checkpoints"), { recursive: true });
  cpSync(
    join(fixtureRoot, "examples/example-exit-checkpoint.json"),
    join(fixtureRoot, "checkpoints/example-quota-exhausted.json")
  );
  writeJson(statePath, {
    ...originalState,
    status: "quota-exhausted",
    exit_reason: "quota-exhausted",
    exit_checkpoint: "checkpoints/example-quota-exhausted.json"
  });
  runValidator(true, "Protocol validation passed.");

  console.log("Protocol negative tests passed.");
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}
