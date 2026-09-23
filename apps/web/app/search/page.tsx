"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import corpus from "../../../../data/corpus.json";

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[–—]/g, "-")
    .trim();
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") ?? "";
    setQuery(initial);
    setInput(initial);
  }, []);

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];

    const terms = q.split(/\s+/).filter(Boolean);
    const output: Array<{
      workId: string;
      workTitle: string;
      collection: string;
      paragraphId: string;
      number: number;
      pali: string;
      english?: string;
      bangla?: string;
    }> = [];

    for (const work of corpus) {
      for (const paragraph of work.paragraphs) {
        const haystack = normalize([
          work.id,
          work.collection,
          work.title,
          work.description,
          paragraph.pali,
          paragraph.english ?? "",
          paragraph.bangla ?? "",
        ].join(" "));

        if (terms.every((term) => haystack.includes(term))) {
          output.push({
            workId: work.id,
            workTitle: work.title,
            collection: work.collection,
            paragraphId: paragraph.id,
            number: paragraph.number,
            pali: paragraph.pali,
            english: paragraph.english,
            bangla: paragraph.bangla,
          });
        }
      }
    }

    return output;
  }, [query]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = input.trim();
    setQuery(value);
    const url = value ? `/search/?q=${encodeURIComponent(value)}` : "/search/";
    router.replace(url);
  }

  return (
    <main className="shell search-page">
      <nav className="topbar">
        <Link href="/">← Digital Dhamma Library</Link>
        <span>Corpus Search</span>
      </nav>

      <header className="reader-header search-header">
        <p className="eyebrow">RESEARCH SEARCH</p>
        <h1>Search the Dhamma</h1>
        <p>Search across titles, metadata, Pāḷi, English, and বাংলা text in the published local corpus.</p>
      </header>

      <form className="search-form large" onSubmit={submit} role="search">
        <label className="sr-only" htmlFor="corpus-search">Search corpus</label>
        <input
          id="corpus-search"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Try: satipaṭṭhāna, Nibbāna, দুঃখ, MN 10…"
          autoFocus
        />
        <button className="button primary" type="submit">Search</button>
      </form>

      <section className="section search-results" aria-live="polite">
        {!query ? (
          <div className="notice">
            <strong>Search tip:</strong> enter a word or phrase. The current Phase 1 corpus is intentionally small; additional licensed texts will be added in later data releases.
          </div>
        ) : (
          <>
            <div className="section-heading">
              <div>
                <p className="eyebrow">RESULTS</p>
                <h2>{results.length} matching paragraph{results.length === 1 ? "" : "s"}</h2>
              </div>
              <span className="badge">“{query}”</span>
            </div>

            {results.length === 0 ? (
              <div className="notice">No matching paragraph was found in the current corpus.</div>
            ) : (
              <div className="result-list">
                {results.map((result) => (
                  <Link
                    className="result-card"
                    key={`${result.workId}-${result.paragraphId}`}
                    href={`/read/${result.workId}/#${result.paragraphId}`}
                  >
                    <div className="result-meta">
                      <span>{result.collection}</span>
                      <span>{result.paragraphId}</span>
                    </div>
                    <h3>{result.workTitle}</h3>
                    <p className="pali result-pali">{result.pali}</p>
                    {result.english && <p>{result.english}</p>}
                    {result.bangla && <p className="bangla">{result.bangla}</p>}
                    <span className="card-link">Open paragraph →</span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
