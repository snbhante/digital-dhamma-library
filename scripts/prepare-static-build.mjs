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

const referencedAssets = [
  ...(manifest.icons || []).map((item) => item.src),
  ...(manifest.shortcuts || []).flatMap((item) => (item.icons || []).map((icon) => icon.src)),
  ...(manifest.screenshots || []).map((item) => item.src),
];
for (const asset of referencedAssets) {
  const assetPath = path.resolve(path.dirname(publicManifest), asset);
  if (!assetPath.startsWith(path.resolve(path.dirname(publicManifest)) + path.sep) || !fs.existsSync(assetPath)) {
    throw new Error(`PWA manifest references a missing or unsafe public asset: ${asset}`);
  }
}

for (const route of ["handle-audio-file", "share-target", "protocol-handler"]) {
  const page = path.join(appDir, route, "page.tsx");
  if (!fs.existsSync(page)) throw new Error(`PWA manifest route is missing: ${path.relative(repoRoot, page)}`);
}

// GitHub Pages uses output: "export", so the share-target route must not
// consume request-time searchParams in a Server Component. The service worker
// persists the POST payload in IndexedDB and the client component reads the
// query string after hydration. Guard this contract to prevent a regression
// that would make next build fail during prerendering.
const shareTargetPage = fs.readFileSync(path.join(appDir, "share-target", "page.tsx"), "utf8");
if (/\bsearchParams\b/.test(shareTargetPage) || /export\s+default\s+async\s+function/.test(shareTargetPage)) {
  throw new Error(
    "The /share-target page must remain a static Server Component; read its query string in a Client Component instead of using the searchParams page prop."
  );
}

console.log(`Static build preparation passed: public/manifest.webmanifest is canonical and ${referencedAssets.length} referenced PWA assets were verified.`);
