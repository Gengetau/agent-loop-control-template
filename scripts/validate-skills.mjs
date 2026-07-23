#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const skills = [
  "control-work-governor",
  "business-work-executor"
];
const errors = [];

for (const skillName of skills) {
  const skillPath = resolve("skills", skillName, "SKILL.md");
  const metadataPath = resolve("skills", skillName, "agents", "openai.yaml");
  if (!existsSync(skillPath)) {
    errors.push(`Missing skill file: ${skillPath}`);
    continue;
  }
  if (!existsSync(metadataPath)) {
    errors.push(`Missing skill metadata: ${metadataPath}`);
    continue;
  }

  const skill = readFileSync(skillPath, "utf8");
  const metadata = readFileSync(metadataPath, "utf8");
  const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) {
    errors.push(`${skillName} is missing YAML frontmatter.`);
    continue;
  }

  const frontmatterKeys = frontmatter[1]
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => line.slice(0, line.indexOf(":")).trim());
  if (
    frontmatterKeys.length !== 2 ||
    !frontmatterKeys.includes("name") ||
    !frontmatterKeys.includes("description")
  ) {
    errors.push(`${skillName} frontmatter must contain only name and description.`);
  }
  if (!frontmatter[1].includes(`name: ${skillName}`)) {
    errors.push(`${skillName} frontmatter name does not match its directory.`);
  }

  for (const phrase of [
    "Prefer the GitHub Connector",
    "tool discovery",
    "Do not start with `gh`",
    "same active Work run"
  ]) {
    if (!skill.includes(phrase)) {
      errors.push(`${skillName} is missing required connector-first instruction: ${phrase}`);
    }
  }
  if (!metadata.includes(`$${skillName}`)) {
    errors.push(`${skillName} default prompt must invoke the skill by name.`);
  }
}

if (errors.length > 0) {
  console.error("Skill validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Role skill validation passed.");
