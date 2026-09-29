import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const web = path.join(root, "apps", "web");
const css = fs.readFileSync(path.join(web, "app", "globals.css"), "utf8");
const reader = fs.readFileSync(path.join(web, "components", "ReaderView.tsx"), "utf8");
const actions = fs.readFileSync(path.join(web, "components", "ParagraphActions.tsx"), "utf8");
const notes = fs.readFileSync(path.join(web, "components", "ParagraphResearchTools.tsx"), "utf8");

const required = [
  ["large desktop breakpoint", /@media \(min-width: 1440px\)/],
  ["desktop/tablet breakpoint", /@media \(max-width: 1023px\)/],
  ["tablet/mobile breakpoint", /@media \(max-width: 767px\)/],
  ["small mobile breakpoint", /@media \(max-width: 479px\)/],
  ["compact mobile breakpoint", /@media \(max-width: 359px\)/],
  ["reduced-motion support", /prefers-reduced-motion/],
  ["paragraph action panel", /paragraph-action-panel/],
  ["note overlay", /note-overlay/],
];

for (const [label, pattern] of required) {
  if (!pattern.test(css)) throw new Error(`UI validation failed: missing ${label}.`);
}

if (!reader.includes("<ParagraphActions")) throw new Error("UI validation failed: ReaderView is not using ParagraphActions.");
if (!reader.includes("target.closest(\"a, button, input, textarea, select, summary, label\")")) {
  throw new Error("UI validation failed: paragraph click handling is not protected from interactive controls.");
}
if (!actions.includes('aria-expanded={open}')) throw new Error("UI validation failed: paragraph action trigger lacks aria-expanded.");
if (!notes.includes('role="dialog"')) throw new Error("UI validation failed: note editor must use a dialog overlay.");
if (!notes.includes("event.key === \"Escape\"")) throw new Error("UI validation failed: note dialog lacks Escape-to-close handling.");

console.log("UI validation passed: responsive layout matrix, contextual paragraph actions, touch/click handling, and note overlay accessibility guards are present.");
