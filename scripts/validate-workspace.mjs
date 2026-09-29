import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "apps/web/app/auth/page.tsx",
  "apps/web/app/account/page.tsx",
  "apps/web/components/AuthProvider.tsx",
  "apps/web/components/AuthForm.tsx",
  "apps/web/components/AccountPanel.tsx",
  "apps/web/lib/supabase.ts",
  "apps/web/lib/workspaceSync.ts",
  "supabase/migrations/0006_phase_3_workspace_2.sql",
  ".env.example",
];

for (const relative of required) {
  if (!fs.existsSync(path.join(root, relative))) throw new Error(`Workspace 2.0 required file is missing: ${relative}`);
}

const sourceFiles = ["apps/web/lib/supabase.ts", "apps/web/components/AuthProvider.tsx", "apps/web/components/AuthForm.tsx", "apps/web/components/AccountPanel.tsx"];
for (const relative of sourceFiles) {
  const source = fs.readFileSync(path.join(root, relative), "utf8");
  if (/service_role|service-role|sb_secret_/i.test(source)) throw new Error(`A forbidden secret-key pattern was found in ${relative}.`);
}

const migration = fs.readFileSync(path.join(root, "supabase/migrations/0006_phase_3_workspace_2.sql"), "utf8");
for (const pattern of ["workspace_snapshots", "enable row level security", "auth.uid() = user_id"]) {
  if (!migration.includes(pattern)) throw new Error(`Workspace migration is missing required security marker: ${pattern}`);
}

const authPage = fs.readFileSync(path.join(root, "apps/web/app/auth/page.tsx"), "utf8");
const accountPage = fs.readFileSync(path.join(root, "apps/web/app/account/page.tsx"), "utf8");
if (/export const dynamic|searchParams|cookies\(/.test(`${authPage}\n${accountPage}`)) {
  throw new Error("Workspace 2.0 account routes must remain static-export safe.");
}

const accountPanel = fs.readFileSync(path.join(root, "apps/web/components/AccountPanel.tsx"), "utf8");
if (!/const activeSession = session;/.test(accountPanel) || !/upsertProfile\(activeSession,/.test(accountPanel)) {
  throw new Error("AccountPanel must capture the authenticated session before using it inside the nested save callback.");
}

console.log("Workspace 2.0 validation passed: auth/profile surfaces, cloud snapshot migration, static-export safety, public-key security boundaries, and AccountPanel TypeScript narrowing guard are present.");
