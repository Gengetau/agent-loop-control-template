#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const pendingDir = "loops/pending";

if (!existsSync(pendingDir)) {
  console.error(`Pending loop directory does not exist: ${pendingDir}`);
  process.exit(1);
}

// Discovery is intentionally strict. Automation should never execute editor
// backup files, notes, copied drafts, date-prefixed files, or partially written
// Markdown. The canonical filename must be exactly <loop_id>.md.
const candidates = [];

for (const entry of readdirSync(pendingDir, { withFileTypes: true })) {
  if (!entry.isFile()) {
    continue;
  }

  if (entry.name === ".gitkeep") {
    continue;
  }

  if (!/^loop-[0-9]{3}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(entry.name)) {
    continue;
  }

  const filePath = join(pendingDir, entry.name);
  const content = readFileSync(filePath, "utf8");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!match) {
    continue;
  }

  const loopIdLine = match[1].split(/\r?\n/).find((line) => line.startsWith("loop_id:"));
  if (!loopIdLine) {
    continue;
  }

  const loopId = loopIdLine.slice("loop_id:".length).trim().replace(/^["']|["']$/g, "");
  const expectedName = `${loopId}.md`;

  if (entry.name !== expectedName) {
    continue;
  }

  candidates.push({
    loop_id: loopId,
    path: filePath.replaceAll("\\", "/")
  });
}

console.log(JSON.stringify({
  pending_directory: pendingDir,
  count: candidates.length,
  candidates
}, null, 2));
