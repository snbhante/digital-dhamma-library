import fs from "node:fs";
import path from "node:path";

const file = path.resolve("data/corpus.json");
const corpus = JSON.parse(fs.readFileSync(file, "utf8"));

const errors = [];
const ids = new Set();

for (const work of corpus) {
  if (!work.id || !work.title) errors.push("Every work requires id and title.");
  if (ids.has(work.id)) errors.push(`Duplicate work id: ${work.id}`);
  ids.add(work.id);

  const paragraphIds = new Set();

  for (const paragraph of work.paragraphs ?? []) {
    if (!paragraph.id || !paragraph.pali) {
      errors.push(`${work.id}: paragraph requires id and pali.`);
    }
    if (paragraphIds.has(paragraph.id)) {
      errors.push(`${work.id}: duplicate paragraph id ${paragraph.id}`);
    }
    paragraphIds.add(paragraph.id);

    if (!paragraph.id.startsWith(`${work.id}.p`)) {
      errors.push(`${paragraph.id}: paragraph id must start with ${work.id}.p`);
    }
  }
}

if (errors.length) {
  console.error("Data validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Data validation passed: ${corpus.length} work(s).`);
