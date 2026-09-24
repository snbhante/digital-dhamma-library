export type ResearchReference = {
  workId: string;
  paragraphId: string;
  number: number;
};

export function normalizeResearchText(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/[–—]/g, "-").trim();
}

export function tokenizePali(value: string): string[] {
  return normalizeResearchText(value).match(/[a-zāīūṅñṇṭḍṇḷṃṁ]+/gi) ?? [];
}

export function makeStableParagraphId(workId: string, number: number): string {
  return `${workId}.p${String(number).padStart(3, "0")}`;
}
