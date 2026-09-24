import fs from "node:fs";
import path from "node:path";

const readJson = (relative) => JSON.parse(fs.readFileSync(path.resolve(relative), "utf8"));
const writeJson = (relative, value) => fs.writeFileSync(path.resolve(relative), `${JSON.stringify(value, null, 2)}\n`, "utf8");

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
    verification: "Requires edition-level verification before scholarly citation or redistribution."
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
const occurrenceMap = new Map();
for (const work of corpus) {
  for (const paragraph of work.paragraphs) {
    for (const match of paragraph.pali.matchAll(tokenPattern)) {
      const token = match[0].toLowerCase();
      const references = occurrenceMap.get(token) ?? [];
      references.push({ workId: work.id, paragraphId: paragraph.id, number: paragraph.number });
      occurrenceMap.set(token, references);
    }
  }
}
const occurrences = [...occurrenceMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([token, references]) => ({ token, count: references.length, references }));

writeJson("data/editions.json", editions);
writeJson("data/translations.json", translations);
writeJson("data/morphology.json", morphology);
writeJson("data/cross-references.json", crossReferences);
writeJson("data/occurrences.json", occurrences);

console.log(`Research indexes generated: ${editions.length} editions, ${translations.length} translations, ${morphology.length} morphology records, ${occurrences.length} indexed tokens, ${crossReferences.length} cross-reference links.`);
