#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const projectPath = resolve("config/project.json");
const examplePath = resolve("config/project.example.json");
const statePath = resolve("state/current.json");

// Prefer a project-specific config when it exists. The example file is safe
// for template users because it contains only placeholders.
const configPath = existsSync(projectPath) ? projectPath : examplePath;

if (!existsSync(configPath)) {
  console.error("No project configuration file was found.");
  process.exit(1);
}

const config = JSON.parse(readFileSync(configPath, "utf8"));

console.log(`Using configuration: ${configPath}`);
console.log("");
console.log("Customize these files before running a real loop:");
console.log("- config/project.json");
console.log("- config/automation.example.json or your deployment-specific automation config");
console.log("- state/current.json when the project is ready to record real repository names");
console.log("- templates/loop.md if your project needs additional required sections");
console.log("");
console.log("Current repository placeholders:");
console.log(`- business_repo: ${config.business_repo}`);
console.log(`- control_repo: ${config.control_repo}`);

// State initialization is deliberately guarded. The script updates
// state/current.json only when a real project config exists and the target
// state file still contains template placeholders.
if (!existsSync(projectPath)) {
  console.log("");
  console.log("No config/project.json file exists, so state/current.json was not changed.");
  process.exit(0);
}

if (!existsSync(statePath)) {
  console.error("state/current.json does not exist. Create it from the template before initialization.");
  process.exit(1);
}

const state = JSON.parse(readFileSync(statePath, "utf8"));
const hasTemplateBusinessRepo = state.business_repo === "OWNER/BUSINESS_REPO";

if (!hasTemplateBusinessRepo) {
  console.log("");
  console.log("state/current.json already contains project-specific values, so it was not changed.");
  process.exit(0);
}

state.business_repo = config.business_repo;
state.control_repo = config.control_repo;
state.last_transition = "project-config-initialized";
state.updated_at = new Date().toISOString();

writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");

console.log("");
console.log("state/current.json was initialized from config/project.json.");
