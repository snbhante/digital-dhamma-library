import fs from "node:fs";
import path from "node:path";

function readJson(relative) { return JSON.parse(fs.readFileSync(path.resolve(relative), "utf8")); }

const corpus = readJson("data/corpus.json");
const dictionary = readJson("data/dictionary.json");
const sources = readJson("data/sources.json");
const errors = [];
const ids = new Set();

if (!Array.isArray(corpus) || corpus.length === 0) errors.push("Corpus must be a non-empty array.");
for (const work of corpus) {
  if (!work.id || !work.title || !work.collection || !work.language || !work.type || !work.edition) errors.push("Every work requires id, title, collection, language, type, and edition.");
  if (ids.has(work.id)) errors.push(`Duplicate work id: ${work.id}`);
  ids.add(work.id);
  if (!Array.isArray(work.paragraphs) || work.paragraphs.length === 0) errors.push(`${work.id}: work requires paragraphs.`);
  if (!work.source?.basis || !work.source?.licenseStatus || !work.source?.provenance) errors.push(`${work.id}: source metadata is incomplete.`);
  const paragraphIds = new Set();
  for (const paragraph of work.paragraphs ?? []) {
    if (!paragraph.id || !paragraph.pali) errors.push(`${work.id}: paragraph requires id and pali.`);
    if (paragraphIds.has(paragraph.id)) errors.push(`${work.id}: duplicate paragraph id ${paragraph.id}`);
    paragraphIds.add(paragraph.id);
    if (!paragraph.id.startsWith(`${work.id}.p`)) errors.push(`${paragraph.id}: paragraph id must start with ${work.id}.p`);
    if (typeof paragraph.number !== "number") errors.push(`${paragraph.id}: number must be numeric.`);
  }
}

const dictionaryIds = new Set();
for (const entry of dictionary) {
  if (!entry.id || !entry.headword || !entry.grammar || !Array.isArray(entry.variants) || !Array.isArray(entry.meanings) || !Array.isArray(entry.sources)) errors.push(`Dictionary entry ${entry.id ?? "<unknown>"} is incomplete.`);
  if (dictionaryIds.has(entry.id)) errors.push(`Duplicate dictionary id: ${entry.id}`);
  dictionaryIds.add(entry.id);
  if (!entry.meanings.length) errors.push(`Dictionary entry ${entry.id}: at least one meaning is required.`);
  for (const meaning of entry.meanings) if (!meaning.english || !meaning.bangla) errors.push(`Dictionary entry ${entry.id}: meaning requires English and Bangla.`);
}

const sourceIds = new Set();
for (const source of sources) {
  if (!source.id || !source.title || !source.kind || !source.edition || !source.licenseStatus || !source.provenance) errors.push(`Source ${source.id ?? "<unknown>"} is incomplete.`);
  if (sourceIds.has(source.id)) errors.push(`Duplicate source id: ${source.id}`);
  sourceIds.add(source.id);
}

if (errors.length) {
  console.error("Data validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const paragraphCount = corpus.reduce((sum, work) => sum + work.paragraphs.length, 0);
console.log(`Data validation passed: ${corpus.length} work(s), ${paragraphCount} paragraph(s), ${dictionary.length} dictionary entries, ${sources.length} source records.`);
