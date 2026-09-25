import fs from "node:fs";
import path from "node:path";

function readJson(relative) { return JSON.parse(fs.readFileSync(path.resolve(relative), "utf8")); }
function requireArray(value, label, errors) { if (!Array.isArray(value) || value.length === 0) errors.push(`${label} must be a non-empty array.`); }
function uniqueIdCheck(items, label, errors) {
  const ids = new Set();
  for (const item of items ?? []) {
    if (!item.id) errors.push(`${label}: record requires id.`);
    else if (ids.has(item.id)) errors.push(`${label}: duplicate id ${item.id}`);
    else ids.add(item.id);
  }
}

const corpus = readJson("data/corpus.json");
const dictionary = readJson("data/dictionary.json");
const sources = readJson("data/sources.json");
const editions = readJson("data/editions.json");
const translations = readJson("data/translations.json");
const morphology = readJson("data/morphology.json");
const occurrences = readJson("data/occurrences.json");
const crossReferences = readJson("data/cross-references.json");
const commentaries = readJson("data/commentaries.json");
const sentences = readJson("data/sentences.json");
const alignments = readJson("data/translation-alignments.json");
const dictionarySources = readJson("data/dictionary-sources.json");
const derivations = readJson("data/derivations.json");
const editionWitnesses = readJson("data/edition-witnesses.json");
const sentenceAlignments = readJson("data/sentence-alignments.json");
const morphologyAnalyses = readJson("data/morphology-analyses.json");
const citationProfiles = readJson("data/citation-profiles.json");
const reviewQueue = readJson("data/review-queue.json");
const errors = [];

for (const [value, label] of [[corpus,"Corpus"],[dictionary,"Dictionary"],[sources,"Sources"],[editions,"Editions"],[translations,"Translations"],[morphology,"Morphology"],[occurrences,"Occurrences"],[crossReferences,"Cross-references"],[commentaries,"Commentaries"],[sentences,"Sentences"],[alignments,"Translation alignments"],[dictionarySources,"Dictionary sources"],[derivations,"Derivations"],[editionWitnesses,"Edition witnesses"],[sentenceAlignments,"Sentence alignments"],[morphologyAnalyses,"Morphology analyses"],[citationProfiles,"Citation profiles"],[reviewQueue,"Review queue"]]) requireArray(value,label,errors);

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

const dictionaryIds = new Set(); const dictionarySlugs = new Set();
for (const entry of dictionary) {
  if (!entry.id || !entry.slug || !entry.headword || !entry.grammar || !Array.isArray(entry.variants) || !Array.isArray(entry.meanings) || !Array.isArray(entry.sources)) errors.push(`Dictionary entry ${entry.id ?? "<unknown>"} is incomplete.`);
  if (dictionaryIds.has(entry.id)) errors.push(`Duplicate dictionary id: ${entry.id}`); dictionaryIds.add(entry.id);
  if (dictionarySlugs.has(entry.slug)) errors.push(`Duplicate dictionary slug: ${entry.slug}`); dictionarySlugs.add(entry.slug);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug ?? "")) errors.push(`Dictionary entry ${entry.id}: slug must be URL-safe ASCII.`);
  if (!entry.meanings.length) errors.push(`Dictionary entry ${entry.id}: at least one meaning is required.`);
  for (const meaning of entry.meanings) if (!meaning.english || !meaning.bangla) errors.push(`Dictionary entry ${entry.id}: meaning requires English and Bangla.`);
}

uniqueIdCheck(sources,"Sources",errors); uniqueIdCheck(editions,"Editions",errors); uniqueIdCheck(translations,"Translations",errors); uniqueIdCheck(morphology,"Morphology",errors); uniqueIdCheck(sentences,"Sentences",errors); uniqueIdCheck(alignments,"Translation alignments",errors); uniqueIdCheck(dictionarySources,"Dictionary sources",errors); uniqueIdCheck(derivations,"Derivations",errors); uniqueIdCheck(editionWitnesses,"Edition witnesses",errors); uniqueIdCheck(sentenceAlignments,"Sentence alignments",errors); uniqueIdCheck(morphologyAnalyses,"Morphology analyses",errors); uniqueIdCheck(citationProfiles,"Citation profiles",errors); uniqueIdCheck(reviewQueue,"Review queue",errors);

for (const edition of editions) if (!edition.edition || !edition.status || !edition.licenseStatus || !edition.provenance || !edition.comparisonRole) errors.push(`Edition ${edition.id ?? "<unknown>"} is incomplete.`);
for (const t of translations) if (!t.language || !t.label || !t.licenseStatus) errors.push(`Translation ${t.id ?? "<unknown>"} is incomplete.`);
for (const m of morphology) if (!m.lemma || !Array.isArray(m.forms) || !m.analysis || !m.confidence) errors.push(`Morphology record ${m.id ?? "<unknown>"} is incomplete.`);

const occurrenceTokens = new Set();
for (const o of occurrences) {
  if (!o.token || !o.normalized || typeof o.count !== "number" || !Array.isArray(o.references)) errors.push(`Occurrence record ${o.token ?? "<unknown>"} is incomplete.`);
  if (occurrenceTokens.has(o.token)) errors.push(`Duplicate occurrence token: ${o.token}`); occurrenceTokens.add(o.token);
  const referenceIds = new Set();
  for (const ref of o.references ?? []) {
    const referenceId = `${ref.workId}-${ref.paragraphId}`;
    if (!workIds.has(ref.workId) || !paragraphIds.has(ref.paragraphId)) errors.push(`Occurrence ${o.token}: invalid reference ${ref.workId}/${ref.paragraphId}`);
    if (referenceIds.has(referenceId)) errors.push(`Occurrence ${o.token}: duplicate paragraph reference ${referenceId}`);
    referenceIds.add(referenceId);
  }
  if (typeof o.paragraphCount !== "number" || o.paragraphCount !== referenceIds.size) errors.push(`Occurrence ${o.token}: paragraphCount must equal unique reference count.`);
  if (!["UNREVIEWED", "NEEDS_REVIEW", "VERIFIED", "REJECTED"].includes(o.reviewStatus)) errors.push(`Occurrence ${o.token}: invalid reviewStatus.`);
}

const sentenceIds = new Set();
for (const sentence of sentences) {
  if (!sentence.id || !sentence.workId || !sentence.paragraphId || !sentence.pali) errors.push(`Sentence ${sentence.id ?? "<unknown>"} is incomplete.`);
  if (sentenceIds.has(sentence.id)) errors.push(`Duplicate sentence id: ${sentence.id}`); sentenceIds.add(sentence.id);
  if (!workIds.has(sentence.workId) || !paragraphIds.has(sentence.paragraphId)) errors.push(`Sentence ${sentence.id}: unknown work/paragraph.`);
  if (!sentence.id.startsWith(`${sentence.paragraphId}.s`)) errors.push(`Sentence ${sentence.id}: stable ID must derive from paragraph ID.`);
}

const translationIds = new Set(translations.map((t) => t.id));
const alignmentIds = new Set();
for (const a of alignments) {
  if (!a.id || !a.translationId || !a.workId || !a.paragraphId || !a.translationText || !a.alignmentType) errors.push(`Translation alignment ${a.id ?? "<unknown>"} is incomplete.`);
  if (alignmentIds.has(a.id)) errors.push(`Duplicate translation alignment id: ${a.id}`); alignmentIds.add(a.id);
  if (!translationIds.has(a.translationId)) errors.push(`Translation alignment ${a.id}: unknown translation ${a.translationId}`);
  if (!workIds.has(a.workId) || !paragraphIds.has(a.paragraphId)) errors.push(`Translation alignment ${a.id}: unknown work/paragraph.`);
}


const sentenceIdSet = new Set(sentences.map((item) => item.id));
for (const a of sentenceAlignments) {
  if (!a.translationId || !a.workId || !a.paragraphId || !a.alignmentType || !a.reviewStatus) errors.push(`Sentence alignment ${a.id ?? "<unknown>"} is incomplete.`);
  if (!translationIds.has(a.translationId)) errors.push(`Sentence alignment ${a.id}: unknown translation ${a.translationId}`);
  if (!workIds.has(a.workId) || !paragraphIds.has(a.paragraphId)) errors.push(`Sentence alignment ${a.id}: unknown work/paragraph.`);
  if (a.sourceSentenceId && !sentenceIdSet.has(a.sourceSentenceId)) errors.push(`Sentence alignment ${a.id}: unknown source sentence ${a.sourceSentenceId}`);
  if (!["NEEDS_REVIEW", "VERIFIED", "REJECTED", "UNREVIEWED"].includes(a.reviewStatus)) errors.push(`Sentence alignment ${a.id}: invalid reviewStatus.`);
}
for (const witness of editionWitnesses) {
  if (!witness.workId || !witness.role || !witness.textStatus || !witness.verificationStatus) errors.push(`Edition witness ${witness.id ?? "<unknown>"} is incomplete.`);
  if (!workIds.has(witness.workId)) errors.push(`Edition witness ${witness.id}: unknown work ${witness.workId}`);
}
for (const analysis of morphologyAnalyses) {
  if (!analysis.id || !analysis.token || !analysis.lemma || !analysis.confidence || !analysis.provenance) errors.push(`Morphology analysis ${analysis.id ?? "<unknown>"} is incomplete.`);
  if (!["UNREVIEWED", "NEEDS_REVIEW", "VERIFIED", "REJECTED"].includes(analysis.reviewStatus)) errors.push(`Morphology analysis ${analysis.id}: invalid reviewStatus.`);
}
for (const profile of citationProfiles) {
  if (!profile.id || !profile.label || !profile.format || !profile.template) errors.push(`Citation profile ${profile.id ?? "<unknown>"} is incomplete.`);
}
for (const item of reviewQueue) {
  if (!item.id || !item.entityType || !item.entityId || !item.status) errors.push(`Review queue item ${item.id ?? "<unknown>"} is incomplete.`);
  if (!["UNREVIEWED", "NEEDS_REVIEW", "VERIFIED", "REJECTED"].includes(item.status)) errors.push(`Review queue item ${item.id}: invalid status.`);
}

const refIds = new Set();
for (const ref of crossReferences) { if (!ref.id || !ref.from || !ref.to || !ref.relation) errors.push("Cross-reference is incomplete."); if (refIds.has(ref.id)) errors.push(`Duplicate cross-reference id: ${ref.id}`); refIds.add(ref.id); if (!workIds.has(ref.from) || !workIds.has(ref.to)) errors.push(`Cross-reference ${ref.id}: unknown target.`); }

if (errors.length) { console.error("Data validation failed:"); for (const error of errors) console.error(`- ${error}`); process.exit(1); }
const paragraphCount = corpus.reduce((sum, work) => sum + work.paragraphs.length, 0);
const occurrenceCount = occurrences.reduce((sum, item) => sum + item.count, 0);
console.log(`Data validation passed: ${corpus.length} work(s), ${paragraphCount} paragraph(s), ${sentences.length} sentence(s), ${dictionary.length} dictionary entries, ${sources.length} source records, ${editions.length} edition(s), ${translations.length} translation resource(s), ${alignments.length} paragraph alignments, ${sentenceAlignments.length} sentence alignments, ${morphology.length} morphology records, ${morphologyAnalyses.length} morphology analyses, ${occurrences.length} indexed tokens / ${occurrenceCount} occurrences, ${editionWitnesses.length} edition witness records, ${citationProfiles.length} citation profiles, ${reviewQueue.length} review queue records, ${derivations.length} derivation records, ${dictionarySources.length} dictionary adapters, ${crossReferences.length} cross-reference links.`);
