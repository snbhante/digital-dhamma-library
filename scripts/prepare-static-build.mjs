import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const webRoot = path.join(repoRoot, "apps", "web");
const appDir = path.join(webRoot, "app");
const nextDir = path.join(webRoot, ".next");
const publicManifest = path.join(webRoot, "public", "manifest.webmanifest");

// The project intentionally uses the static public manifest for GitHub Pages.
// Older releases used app/manifest.ts. When a user overlays a ZIP on an
// existing checkout, deleted files are not removed by the file copy, so this
// cleanup makes the migration safe and deterministic.
const staleManifestNames = [
  "manifest.ts",
  "manifest.tsx",
  "manifest.js",
  "manifest.jsx",
  "manifest.mjs",
  "manifest.cjs",
];

for (const name of staleManifestNames) {
  const filePath = path.join(appDir, name);
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath, { force: true });
    console.log(`Removed stale Next.js manifest route: ${path.relative(repoRoot, filePath)}`);
  }
}

// Remove generated Next output so an old manifest route cannot survive into a
// new static-export build. Next.js will recreate .next during typegen/build.
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log(`Removed generated Next.js output: ${path.relative(repoRoot, nextDir)}`);
}

if (!fs.existsSync(publicManifest)) {
  throw new Error(
    `Required static PWA manifest is missing: ${path.relative(repoRoot, publicManifest)}`
  );
}

const manifest = JSON.parse(fs.readFileSync(publicManifest, "utf8"));
for (const field of ["name", "short_name", "start_url", "scope", "display"]) {
  if (!manifest[field]) {
    throw new Error(`PWA manifest is missing required field: ${field}`);
  }
}

console.log("Static build preparation passed: public/manifest.webmanifest is the canonical PWA manifest.");
