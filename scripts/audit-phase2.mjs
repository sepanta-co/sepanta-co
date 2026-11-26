import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, "src");

function walkSourceFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkSourceFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results.sort();
}

function main() {
  const errors = [];

  // 1. Scan all src/**/*.ts(x) for Arabic characters & physical directional Tailwind classes
  const srcFiles = walkSourceFiles(SRC_DIR);
  for (const filePath of srcFiles) {
    const rel = path.relative(ROOT_DIR, filePath);
    const content = fs.readFileSync(filePath, "utf8");

    if (/[\u064A\u0643\u0629]/.test(content)) {
      errors.push(`${rel}: contains Arabic character (ي / ك / ة)`);
    }

    if (/\b(ml|mr|pl|pr|left|right)-[0-9a-zA-Z]|text-(left|right)\b/.test(content)) {
      errors.push(`${rel}: contains physical directional Tailwind class`);
    }
  }

  // 2. Verify .gitignore and .dockerignore protect runtime secrets/data/uploads/backups
  const gitignore = fs.readFileSync(path.join(ROOT_DIR, ".gitignore"), "utf8");
  const dockerignore = fs.readFileSync(
    path.join(ROOT_DIR, ".dockerignore"),
    "utf8"
  );

  for (const requiredPattern of [".env*", "data/", "uploads/", "backups/"]) {
    if (!gitignore.includes(requiredPattern)) {
      errors.push(`.gitignore missing protection for ${requiredPattern}`);
    }
    if (!dockerignore.includes(requiredPattern)) {
      errors.push(`.dockerignore missing protection for ${requiredPattern}`);
    }
  }

  // 3. Verify robots.ts disallows /admin/ and /api/
  const robotsSrc = fs.readFileSync(
    path.join(SRC_DIR, "app", "robots.ts"),
    "utf8"
  );
  if (!robotsSrc.includes('"/admin/"') || !robotsSrc.includes('"/api/"')) {
    errors.push("src/app/robots.ts must disallow both /admin/ and /api/");
  }

  if (errors.length > 0) {
    console.error("PHASE_2_AUDIT_FAILED:");
    for (const err of errors) {
      console.error(` - ${err}`);
    }
    process.exit(1);
  }

  console.log("PHASE_2_AUDIT_PASSED", {
    srcFilesAudited: srcFiles.length,
    robotsProtected: true,
    ignoreFilesProtected: true,
  });
}

main();
