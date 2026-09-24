import fs from "node:fs";
import path from "node:path";

function readJson(relative) { return JSON.parse(fs.readFileSync(path.resolve(relative), "utf8")); }
function requireArray(value, label, errors) { if (!Array.isArray(value) || value.length === 0) errors.push(`${label} must be a non-empty array.`); }

const corpus = readJson("data/corpus.json");
const dictionary = readJson("data/dictionary.json");
const sources = readJson("data/sources.json");
const editions = readJson("data/editions.json");
const translations = readJson("data/translations.json");
const morphology = readJson("data/morphology.json");
const occurrences = readJson("data/occurrences.json");
const crossReferences = readJson("data/cross-references.json");
const commentaries = readJson("data/commentaries.json");
const errors = [];

requireArray(corpus, "Corpus", errors); requireArray(dictionary, "Dictionary", errors); requireArray(sources, "Sources", errors);
requireArray(editions, "Editions", errors); requireArray(translations, "Translations", errors); requireArray(morphology, "Morphology", errors);
requireArray(occurrences, "Occurrences", errors); requireArray(crossReferences, "Cross-references", errors); requireArray(commentaries, "Commentaries", errors);

const workIds = new Set();
const paragraphIds = new Set();
for (const work of corpus) {
  if (!work.id || !work.title || !work.collection || !work.language || !work.type || !work.edition) errors.push("Every work requires id, title, collection, language, type, and edition.");
  if (workIds.has(work.id)) errors.push(`Duplicate work id: ${work.id}`); workIds.add(work.id);
  if (!Array.isArray(work.paragraphs) || work.paragraphs.length === 0) errors.push(`${work.id}: work requires paragraphs.`);
  if (!work.source?.basis || !work.source?.licenseStatus || !work.source?.provenance) errors.push(`${work.id}: source metadata is incomplete.`);
  const local = new Set();
  for (const paragraph of work.paragraphs ?? []) {
    if (!paragraph.id || !paragraph.pali) errors.push(`${work.id}: paragraph requires id and pali.`);
    if (local.has(paragraph.id)) errors.push(`${work.id}: duplicate paragraph id ${paragraph.id}`); local.add(paragraph.id);
    if (paragraphIds.has(paragraph.id)) errors.push(`Duplicate global paragraph id: ${paragraph.id}`); paragraphIds.add(paragraph.id);
    if (!paragraph.id.startsWith(`${work.id}.p`)) errors.push(`${paragraph.id}: paragraph id must start with ${work.id}.p`);
    if (typeof paragraph.number !== "number") errors.push(`${paragraph.id}: number must be numeric.`);
  }
}

const dictionaryIds = new Set();
for (const entry of dictionary) {
  if (!entry.id || !entry.headword || !entry.grammar || !Array.isArray(entry.variants) || !Array.isArray(entry.meanings) || !Array.isArray(entry.sources)) errors.push(`Dictionary entry ${entry.id ?? "<unknown>"} is incomplete.`);
  if (dictionaryIds.has(entry.id)) errors.push(`Duplicate dictionary id: ${entry.id}`); dictionaryIds.add(entry.id);
  if (!entry.meanings.length) errors.push(`Dictionary entry ${entry.id}: at least one meaning is required.`);
  for (const meaning of entry.meanings) if (!meaning.english || !meaning.bangla) errors.push(`Dictionary entry ${entry.id}: meaning requires English and Bangla.`);
}

const sourceIds = new Set(); for (const source of sources) { if (!source.id || !source.title || !source.kind || !source.edition || !source.licenseStatus || !source.provenance) errors.push(`Source ${source.id ?? "<unknown>"} is incomplete.`); if (sourceIds.has(source.id)) errors.push(`Duplicate source id: ${source.id}`); sourceIds.add(source.id); }
const editionIds = new Set(); for (const edition of editions) { if (!edition.id || !edition.edition || !edition.status || !edition.licenseStatus || !edition.provenance) errors.push(`Edition ${edition.id ?? "<unknown>"} is incomplete.`); if (editionIds.has(edition.id)) errors.push(`Duplicate edition id: ${edition.id}`); editionIds.add(edition.id); }
const translationIds = new Set(); for (const t of translations) { if (!t.id || !t.language || !t.label || !t.licenseStatus) errors.push(`Translation ${t.id ?? "<unknown>"} is incomplete.`); if (translationIds.has(t.id)) errors.push(`Duplicate translation id: ${t.id}`); translationIds.add(t.id); }
const morphologyIds = new Set(); for (const m of morphology) { if (!m.id || !m.lemma || !Array.isArray(m.forms) || !m.analysis || !m.confidence) errors.push(`Morphology record ${m.id ?? "<unknown>"} is incomplete.`); if (morphologyIds.has(m.id)) errors.push(`Duplicate morphology id: ${m.id}`); morphologyIds.add(m.id); }
const occurrenceTokens = new Set(); for (const o of occurrences) { if (!o.token || typeof o.count !== "number" || !Array.isArray(o.references)) errors.push(`Occurrence record ${o.token ?? "<unknown>"} is incomplete.`); if (occurrenceTokens.has(o.token)) errors.push(`Duplicate occurrence token: ${o.token}`); occurrenceTokens.add(o.token); for (const ref of o.references ?? []) if (!workIds.has(ref.workId) || !paragraphIds.has(ref.paragraphId)) errors.push(`Occurrence ${o.token}: invalid reference ${ref.workId}/${ref.paragraphId}`); }
const refIds = new Set(); for (const ref of crossReferences) { if (!ref.id || !ref.from || !ref.to || !ref.relation) errors.push(`Cross-reference is incomplete.`); if (refIds.has(ref.id)) errors.push(`Duplicate cross-reference id: ${ref.id}`); refIds.add(ref.id); if (!workIds.has(ref.from) || !workIds.has(ref.to)) errors.push(`Cross-reference ${ref.id}: unknown target.`); }

if (errors.length) { console.error("Data validation failed:"); for (const error of errors) console.error(`- ${error}`); process.exit(1); }
const paragraphCount = corpus.reduce((sum, work) => sum + work.paragraphs.length, 0);
const occurrenceCount = occurrences.reduce((sum, item) => sum + item.count, 0);
console.log(`Data validation passed: ${corpus.length} work(s), ${paragraphCount} paragraph(s), ${dictionary.length} dictionary entries, ${sources.length} source records, ${editions.length} edition(s), ${translations.length} translation resource(s), ${morphology.length} morphology records, ${occurrences.length} indexed tokens / ${occurrenceCount} occurrences, ${crossReferences.length} cross-reference links.`);
