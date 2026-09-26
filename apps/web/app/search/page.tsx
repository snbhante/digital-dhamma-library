"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import corpus from "../../../../data/corpus.json";
import SaveSearchButton from "../../components/SaveSearchButton";

type Work = (typeof corpus)[number];
type SearchField = "all" | "pali" | "english" | "bangla" | "metadata";

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/[–—]/g, "-").trim();
}

function termsFromQuery(value: string) {
  const phraseMatches = [...value.matchAll(/"([^\"]+)"/g)].map((m) => normalize(m[1]));
  const withoutPhrases = value.replace(/"([^\"]+)"/g, " ");
  const terms = withoutPhrases.split(/\s+/).map(normalize).filter(Boolean);
  return { phraseMatches, terms };
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [field, setField] = useState<SearchField>("all");
  const [collection, setCollection] = useState("all");
  const [type, setType] = useState("all");
  const [language, setLanguage] = useState("all");
  const [limit, setLimit] = useState("100");
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") ?? "";
    setQuery(initial);
    setInput(initial);
    setField((params.get("field") as SearchField) || "all");
    setCollection(params.get("collection") || "all");
    setType(params.get("type") || "all");
    setLanguage(params.get("language") || "all");
    setLimit(params.get("limit") || "100");
  }, []);

  const collections = useMemo(() => [...new Set(corpus.map((work) => work.collection))].sort(), []);
  const types = useMemo(() => [...new Set(corpus.map((work) => work.type))].sort(), []);
  const languages = useMemo(() => [...new Set(corpus.map((work) => work.language))].sort(), []);

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    const { phraseMatches, terms } = termsFromQuery(q);
    const max = Number(limit) || 100;
    const output: Array<{
      workId: string; workTitle: string; collection: string; paragraphId: string;
      number: number; pali: string; english?: string; bangla?: string; score: number;
    }> = [];

    const matches = (paragraph: Work["paragraphs"][number], work: Work) => {
      if (collection !== "all" && work.collection !== collection) return false;
      if (type !== "all" && work.type !== type) return false;
      if (language !== "all" && work.language !== language) return false;

      const fields = {
        pali: normalize(paragraph.pali),
        english: normalize(paragraph.english ?? ""),
        bangla: normalize(paragraph.bangla ?? ""),
        metadata: normalize([work.id, work.collection, work.title, work.description].join(" ")),
      };
      const haystack = field === "all" ? Object.values(fields).join(" ") : fields[field];
      if (!terms.every((term) => haystack.includes(term)) || !phraseMatches.every((phrase) => haystack.includes(phrase))) return false;
      return true;
    };

    for (const work of corpus) {
      for (const paragraph of work.paragraphs) {
        if (!matches(paragraph, work)) continue;
        const fields = {
          pali: normalize(paragraph.pali),
          english: normalize(paragraph.english ?? ""),
          bangla: normalize(paragraph.bangla ?? ""),
          metadata: normalize([work.id, work.collection, work.title, work.description].join(" ")),
        };
        const score = terms.reduce((total, term) => {
          const fieldNames = field === "all" ? (Object.keys(fields) as Array<keyof typeof fields>) : [field];
          return total + fieldNames.reduce((s, key) => s + (fields[key].includes(term) ? (fields[key].startsWith(term) ? 4 : 2) : 0), 0);
        }, 0) + phraseMatches.length * 3;
        output.push({ workId: work.id, workTitle: work.title, collection: work.collection, paragraphId: paragraph.id, number: paragraph.number, pali: paragraph.pali, english: paragraph.english, bangla: paragraph.bangla, score });
      }
    }
    const unique = Array.from(new Map(output.map((item) => [`${item.workId}-${item.paragraphId}`, item])).values());
    return unique.sort((a, b) => b.score - a.score || a.paragraphId.localeCompare(b.paragraphId)).slice(0, max);
  }, [query, field, collection, type, language, limit]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = input.trim();
    setQuery(value);
    const params = new URLSearchParams();
    if (value) params.set("q", value);
    if (field !== "all") params.set("field", field);
    if (collection !== "all") params.set("collection", collection);
    if (type !== "all") params.set("type", type);
    if (language !== "all") params.set("language", language);
    if (limit !== "100") params.set("limit", limit);
    router.replace(params.toString() ? `/search/?${params.toString()}` : "/search/");
  }

  return (
    <main id="main-content" className="shell search-page">
      <nav className="topbar"><Link href="/">← Digital Dhamma Library</Link><span>Research Search</span></nav>
      <header className="reader-header search-header">
        <p className="eyebrow">PHASE 1.3 RESEARCH SEARCH</p>
        <h1>Search the Dhamma</h1>
        <p>Search titles, metadata, Pāḷi, English, and বাংলা with phrase matching, filters, and lightweight relevance ordering.</p>
      </header>

      <form className="search-form large" onSubmit={submit} role="search">
        <label className="sr-only" htmlFor="corpus-search">Search corpus</label>
        <input id="corpus-search" value={input} onChange={(event) => setInput(event.target.value)} placeholder={'Try: satipaṭṭhāna, "nibbāna", দুঃখ, MN 10…'} autoFocus />
        <button className="button primary" type="submit">Search</button>
      </form>

      <section className="filters" aria-label="Search filters">
        <label>Field<select value={field} onChange={(e) => setField(e.target.value as SearchField)}><option value="all">All fields</option><option value="pali">Pāḷi</option><option value="english">English</option><option value="bangla">বাংলা</option><option value="metadata">Metadata</option></select></label>
        <label>Collection<select value={collection} onChange={(e) => setCollection(e.target.value)}><option value="all">All collections</option>{collections.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label>Type<select value={type} onChange={(e) => setType(e.target.value)}><option value="all">All types</option>{types.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label>Language<select value={language} onChange={(e) => setLanguage(e.target.value)}><option value="all">All languages</option>{languages.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label>Limit<select value={limit} onChange={(e) => setLimit(e.target.value)}><option value="25">25</option><option value="50">50</option><option value="100">100</option><option value="250">250</option></select></label>
      </section>

      <section className="section search-results" aria-live="polite">
        {!query ? <div className="notice"><strong>Search tips:</strong> use quotes for an exact phrase, for example <code>"sabbaṃ ādittaṃ"</code>. Filters can be combined.</div> : <>
          <div className="section-heading"><div><p className="eyebrow">RESULTS</p><h2>{results.length} matching paragraph{results.length === 1 ? "" : "s"}</h2></div><div className="reader-actions"><span className="badge">“{query}”</span>{query && <SaveSearchButton query={query} field={field} collection={collection} type={type} language={language} limit={limit} />}</div></div>
          {results.length === 0 ? <div className="notice">No matching paragraph was found with the current query and filters.</div> : <div className="result-list">{results.map((result) => <Link className="result-card" key={`${result.workId}-${result.paragraphId}`} href={`/read/${result.workId}/#${result.paragraphId}`}>
            <div className="result-meta"><span>{result.collection}</span><span>{result.paragraphId}</span><span>relevance {result.score}</span></div>
            <h3>{result.workTitle}</h3><p className="pali result-pali">{result.pali}</p>{result.english && <p>{result.english}</p>}{result.bangla && <p className="bangla">{result.bangla}</p>}<span className="card-link">Open paragraph →</span>
          </Link>)}</div>}
        </>}
      </section>
    </main>
  );
}
