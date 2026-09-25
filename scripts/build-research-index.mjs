import fs from "node:fs";
import path from "node:path";

const readJson = (relative) => JSON.parse(fs.readFileSync(path.resolve(relative), "utf8"));
const writeJson = (relative, value) => fs.writeFileSync(path.resolve(relative), `${JSON.stringify(value, null, 2)}\n`, "utf8");
const normalize = (value) => value.normalize("NFKC").toLocaleLowerCase().replace(/[–—]/g, "-").trim();

const corpus = readJson("data/corpus.json");
const dictionary = readJson("data/dictionary.json");

const editions = [];
const seenEditions = new Set();
for (const work of corpus) {
  if (seenEditions.has(work.edition)) continue;
  seenEditions.add(work.edition);
  editions.push({
    id: work.edition.toLowerCase().replaceAll("_", "-"),
    edition: work.edition,
    title: `${work.title.split(" — ")[0]} starter edition`,
    status: "STARTER",
    language: work.language,
    sourceBasis: work.source.basis,
    licenseStatus: work.source.licenseStatus,
    provenance: work.source.provenance,
    isCriticalEdition: false,
    verification: "Requires edition-level verification before scholarly citation or redistribution.",
    comparisonRole: "PRIMARY_STARTER",
    variantTextStatus: "No independent alternate-edition text bundled in this release."
  });
}

const translations = [
  { id: "project-english-2026-09", language: "English", label: "Project-curated English starter translation", type: "PROJECT_CURATED", status: "STARTER", licenseStatus: "Verify record-level rights before redistribution.", scope: "English fields embedded in the starter corpus." },
  { id: "project-bangla-2026-09", language: "বাংলা", label: "Project-curated Bangla starter translation", type: "PROJECT_CURATED", status: "STARTER", licenseStatus: "Verify record-level rights before redistribution.", scope: "Bangla fields embedded in the starter corpus." }
];

const morphology = dictionary.map((entry) => ({
  id: entry.id,
  lemma: entry.headword,
  category: "STARTER_LEXEME",
  forms: entry.variants,
  analysis: entry.grammar,
  confidence: "starter",
  note: "Starter lexical-form index only; do not treat as a complete morphological parser or final grammatical analysis."
}));

const related = {
  mn10: ["mn21", "sn56.11"], mn21: ["mn10", "sn22.59"], mn22: ["mn10", "sn22.59"],
  "sn56.11": ["mn10", "sn22.59"], "sn22.59": ["mn22", "sn56.11"], "sn35.28": ["mn10", "sn56.11"],
  "an3.65": ["dhp183"], khp5: ["mn10", "sn56.11"], khp6: ["sn56.11"], khp9: ["mn10"],
  dhp1: ["dhp183"], dhp183: ["dhp1", "an3.65"], "ud1.10": ["mn10"], dn16: ["sn56.11"]
};
const crossReferences = [];
for (const [from, targets] of Object.entries(related)) {
  for (const to of targets) crossReferences.push({ id: `${from}__related__${to}`, from, to, relation: "research-related", note: "Curated navigation link for research exploration; not a claim of textual dependence." });
}

const tokenPattern = /[A-Za-zĀĪŪṄÑṆṬḌṇḷṃṁāīūṭḍḷṅñ']+/g;
const formToLemma = new Map();
for (const entry of morphology) {
  const lemma = normalize(entry.lemma);
  formToLemma.set(lemma, lemma);
  for (const form of entry.forms) formToLemma.set(normalize(form), lemma);
}

const occurrenceMap = new Map();
for (const work of corpus) {
  for (const paragraph of work.paragraphs) {
    for (const match of paragraph.pali.matchAll(tokenPattern)) {
      const token = normalize(match[0]);
      const record = occurrenceMap.get(token) ?? { token, normalized: token, lemma: formToLemma.get(token) ?? null, count: 0, references: new Map() };
      record.count += 1;
      if (!record.lemma) record.lemma = formToLemma.get(token) ?? null;
      const referenceKey = `${work.id}-${paragraph.id}`;
      if (!record.references.has(referenceKey)) {
        record.references.set(referenceKey, { workId: work.id, paragraphId: paragraph.id, number: paragraph.number });
      }
      occurrenceMap.set(token, record);
    }
  }
}
const occurrences = [...occurrenceMap.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, record]) => ({ token: record.token, normalized: record.normalized, lemma: record.lemma, count: record.count, paragraphCount: record.references.size, references: [...record.references.values()] }));

const sentences = [];
for (const work of corpus) {
  for (const paragraph of work.paragraphs) {
    const parts = paragraph.pali.trim().split(/(?<=[.!?])\s+/).map((text) => text.trim()).filter(Boolean);
    parts.forEach((text, index) => sentences.push({
      id: `${paragraph.id}.s${String(index + 1).padStart(3, "0")}`,
      workId: work.id,
      paragraphId: paragraph.id,
      number: index + 1,
      pali: text,
      segmentationMethod: "PUNCTUATION_HEURISTIC",
      confidence: "starter",
      note: "Starter sentence segmentation derived from punctuation; paragraph IDs remain canonical and unchanged."
    }));
  }
}

const translationDefinitions = new Map(translations.map((item) => [item.id, item]));
const translationAlignments = [];
for (const work of corpus) {
  for (const paragraph of work.paragraphs) {
    for (const [translationId, language, key] of [
      ["project-english-2026-09", "English", "english"],
      ["project-bangla-2026-09", "বাংলা", "bangla"]
    ]) {
      if (!translationDefinitions.has(translationId) || !paragraph[key]) continue;
      translationAlignments.push({
        id: `${translationId}__${paragraph.id}`,
        translationId,
        workId: work.id,
        paragraphId: paragraph.id,
        language,
        sourceTextUnit: "paragraph",
        translationText: paragraph[key],
        alignmentType: "PARAGRAPH_1_TO_1",
        confidence: "starter",
        note: "Project-curated starter alignment. Sentence-level alignment should be reviewed when sentence-aware translations are imported."
      });
    }
  }
}

const dictionarySources = [
  { id: "project-curated", title: "Project-curated starter dictionary adapter", sourceKind: "PROJECT_CURATED", status: "ACTIVE", licenseStatus: "Project-created records; verify each record before scholarly reuse.", mapping: "headword → variants → meanings → references", note: "Reference adapter contract for native project records." },
  { id: "dpd-adapter-template", title: "Digital Pāḷi Dictionary (DPD) adapter template", sourceKind: "EXTERNAL_DICTIONARY", status: "PLANNED", licenseStatus: "Not imported; licensing/redistribution terms must be verified before data ingestion.", mapping: "headword → senses → forms → grammar → references", note: "Adapter metadata only; no DPD dataset is bundled." },
  { id: "ped-adapter-template", title: "Pali-English Dictionary (PED) adapter template", sourceKind: "EXTERNAL_DICTIONARY", status: "PLANNED", licenseStatus: "Not imported; licensing/redistribution terms must be verified before data ingestion.", mapping: "headword → senses → grammatical notes → references", note: "Adapter metadata only; no protected database is bundled." },
  { id: "pea-adapter-template", title: "Pali-English Academy/PEA adapter template", sourceKind: "EXTERNAL_DICTIONARY", status: "PLANNED", licenseStatus: "Not imported; licensing/redistribution terms must be verified before data ingestion.", mapping: "headword → senses → examples → references", note: "Adapter metadata only; no protected database is bundled." },
  { id: "dppn-adapter-template", title: "Dictionary of Pali Proper Names adapter template", sourceKind: "REFERENCE_WORK", status: "PLANNED", licenseStatus: "Not imported; rights and source edition must be verified.", mapping: "name → person/place/entity → references", note: "Adapter metadata only." }
];

const derivations = [];
for (const entry of dictionary) {
  for (const form of entry.variants ?? []) {
    if (form === "mettācitta") derivations.push({ id: "mettacitta__compound", headword: form, base: "mettā", components: ["mettā", "citta"], relation: "COMPOUND", confidence: "starter", analysis: "mettā + citta", note: "Starter compound metadata; consult a full Pāḷi grammar/commentary source before treating this as an authoritative derivation." });
  }
}
for (const item of morphology) {
  for (const form of item.forms) {
    if (form === item.lemma || form === "mettācitta") continue;
    derivations.push({ id: `${item.id}__${normalize(form)}__form-of`, headword: form, base: item.lemma, components: [item.lemma], relation: "FORM_OF", confidence: item.confidence, analysis: item.analysis, note: "Starter lexical-form relation inherited from morphology index; not a complete inflectional parser." });
  }
}

writeJson("data/editions.json", editions);
writeJson("data/translations.json", translations);
writeJson("data/morphology.json", morphology);
writeJson("data/cross-references.json", crossReferences);
writeJson("data/occurrences.json", occurrences);
writeJson("data/sentences.json", sentences);
writeJson("data/translation-alignments.json", translationAlignments);
writeJson("data/dictionary-sources.json", dictionarySources);
writeJson("data/derivations.json", derivations);

console.log(`Research indexes generated: ${editions.length} editions, ${translations.length} translations, ${morphology.length} morphology records, ${occurrences.length} indexed tokens, ${sentences.length} sentence records, ${translationAlignments.length} translation alignments, ${dictionarySources.length} dictionary adapters, ${derivations.length} derivation records, ${crossReferences.length} cross-reference links.`);
