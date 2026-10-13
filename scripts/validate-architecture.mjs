import fs from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const web = path.join(root, "apps", "web");
const failures = [];
const exists = (p) => fs.existsSync(p);

const rootPkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const webPkg = JSON.parse(fs.readFileSync(path.join(web, "package.json"), "utf8"));
const lock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8"));

if (rootPkg.version !== "0.15.2") failures.push(`root package version is ${rootPkg.version}, expected 0.15.2`);
if (webPkg.version !== "0.15.2") failures.push(`web package version is ${webPkg.version}, expected 0.15.2`);
if (webPkg.dependencies?.next !== "16.3.8") failures.push(`Next.js dependency is ${webPkg.dependencies?.next}, expected 16.3.8`);
if (lock.packages?.["apps/web"]?.dependencies?.next !== "16.3.8") failures.push("package-lock apps/web Next.js version is not 16.3.8");
if (lock.packages?.["node_modules/next"]?.version !== "16.3.8") failures.push("package-lock node_modules/next is not 16.3.8");

for (const file of [path.join(web, "middleware.ts"), path.join(web, "middleware.js"), path.join(web, "proxy.ts"), path.join(web, "proxy.js"), path.join(web, "utils", "supabase", "middleware.ts"), path.join(web, "utils", "supabase", "server.ts")]) {
  if (exists(file)) failures.push(`unsupported request-time convention exists: ${path.relative(root, file)}`);
}

const migrations = fs.readdirSync(path.join(root, "supabase", "migrations")).filter((name) => name.endsWith(".sql"));
const migrationNumbers = migrations.map((name) => name.match(/^(\d+)_/)?.[1]).filter(Boolean);
const duplicateNumbers = migrationNumbers.filter((n, i) => migrationNumbers.indexOf(n) !== i);
if (duplicateNumbers.length) failures.push(`duplicate migration numbers: ${[...new Set(duplicateNumbers)].join(", ")}`);

const sourceRoots = [web];
const banned = [
  /getStaticProps\s*\(/,
  /getStaticPaths\s*\(/,
  /\bservice_role\b/i,
];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", ".next", "node_modules"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx?|jsx?|mjs|cjs)$/.test(entry.name)) {
      const text = fs.readFileSync(full, "utf8");
      for (const pattern of banned) if (pattern.test(text)) failures.push(`forbidden runtime pattern ${pattern} in ${path.relative(root, full)}`);
    }
  }
}
for (const dir of sourceRoots) walk(dir);

// A developer may legitimately keep .env.local in the working tree. Do not
// fail merely because it exists: require ignore rules and ensure no real env
// files are committed to Git. Release ZIPs are separately sanitized at packaging.
const gitignorePath = path.join(root, ".gitignore");
if (!exists(path.join(root, ".env.example"))) failures.push(".env.example is missing");
if (!exists(gitignorePath)) {
  failures.push(".gitignore is missing; local environment files cannot be safely excluded");
} else {
  const ignoreText = fs.readFileSync(gitignorePath, "utf8");
  if (!/^\s*\.env\.\*\s*$/m.test(ignoreText)) failures.push(".gitignore must ignore .env.* files");
  if (!/^\s*!\.env\.example\s*$/m.test(ignoreText)) failures.push(".gitignore must explicitly allow .env.example");
}
const gitTracked = spawnSync("git", ["ls-files", "-z"], { cwd: root, encoding: "buffer", windowsHide: true });
if (!gitTracked.error && gitTracked.status === 0) {
  const trackedPaths = gitTracked.stdout.toString("utf8").split("\0").filter(Boolean);
  const trackedEnvFiles = trackedPaths.filter((file) => {
    const base = path.posix.basename(file.replaceAll("\\", "/"));
    return base.startsWith(".env") && base !== ".env.example";
  });
  if (trackedEnvFiles.length) failures.push(`credential/environment files are tracked by Git: ${trackedEnvFiles.join(", ")}`);
}
if (!exists(path.join(root, "supabase", "migrations", "0009_phase_4_3_admin_control_plane.sql"))) failures.push("Phase 4.3 admin control-plane migration is missing");
if (!exists(path.join(root, "supabase", "migrations", "0010_auth_profile_backfill.sql"))) failures.push("Auth profile backfill migration is missing");

const browserClientPath = path.join(web, "utils", "supabase", "client.ts");
if (exists(browserClientPath)) {
  const browserClientText = fs.readFileSync(browserClientPath, "utf8");
  if (/dummy\.supabase\.co|dummy_key/i.test(browserClientText)) failures.push("Supabase browser client must not fall back to a dummy URL/key");
}
const pagesWorkflowPath = path.join(root, ".github", "workflows", "pages.yml");
if (exists(pagesWorkflowPath)) {
  const pagesWorkflowText = fs.readFileSync(pagesWorkflowPath, "utf8");
  if (!/Verify Supabase public configuration/.test(pagesWorkflowText)) failures.push("GitHub Pages workflow must validate Supabase public configuration before building");
}
const profileMigrationPath = path.join(root, "supabase", "migrations", "0010_auth_profile_backfill.sql");
if (exists(profileMigrationPath)) {
  const profileMigrationText = fs.readFileSync(profileMigrationPath, "utf8");
  for (const column of ["interface_language", "public_profile", "preferences", "contributor_handle"]) {
    if (!profileMigrationText.includes(column)) failures.push(`Auth profile migration does not ensure profiles.${column}`);
  }
}

const nextConfig = fs.readFileSync(path.join(web, "next.config.ts"), "utf8");
if (!/output:\s*["']export["']/.test(nextConfig)) failures.push("Next.js static export is not enabled");
if (/middleware|proxy/i.test(nextConfig)) failures.push("next.config.ts contains middleware/proxy configuration in the static profile");

if (failures.length) {
  console.error("Architecture validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Architecture validation passed: v0.15.2, Next.js 16.3.8, static-export boundary, migration numbering, security boundaries, and environment-file hygiene are consistent.");
