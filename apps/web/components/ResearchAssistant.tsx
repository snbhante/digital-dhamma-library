"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import corpus from "../../../data/corpus.json";
import dictionary from "../../../data/dictionary.json";
import policy from "../../../data/research-assistant-policy.json";

function normalize(value: string) { return value.normalize("NFKC").toLocaleLowerCase().trim(); }

export default function ResearchAssistant() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const results = useMemo(() => {
    const terms = normalize(submitted).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return corpus.flatMap((work) => work.paragraphs.map((paragraph) => {
      const haystack = normalize([paragraph.pali, paragraph.english ?? "", paragraph.bangla ?? "", work.title, work.collection].join(" "));
      const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? (paragraph.pali.toLocaleLowerCase().includes(term) ? 4 : 2) : 0), 0);
      return { work, paragraph, score };
    })).filter((item) => item.score > 0).sort((a,b) => b.score-a.score || a.paragraph.id.localeCompare(b.paragraph.id)).slice(0, 12);
  }, [submitted]);
  const dictionaryMatches = useMemo(() => { const q=normalize(submitted); return q ? dictionary.filter((item) => normalize([item.headword, ...item.variants].join(" ")).includes(q)).slice(0,5) : []; }, [submitted]);

  return <section className="section research-assistant"><div className="card"><span className="card-kicker">CITATION-FIRST RESEARCH ASSISTANT</span><h2>Ask the current dataset</h2><p>Enter a research term or phrase. This v0.13.0 foundation retrieves local source records and dictionary metadata; it does not invent answers when the dataset has no supporting record.</p><form className="search-form large" onSubmit={(event) => { event.preventDefault(); setSubmitted(query.trim()); }}><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try: mettā, nibbāna, satipaṭṭhāna…" /><button className="button primary">Retrieve evidence</button></form></div>{submitted && <div className="section"><div className="section-heading"><div><p className="eyebrow">EVIDENCE</p><h2>{results.length} source passages</h2></div><span className="badge">{policy.mode}</span></div><div className="result-list">{results.map((item) => <Link className="result-card" href={`/research-reader/${item.work.id}/?p=${encodeURIComponent(item.paragraph.id)}&tab=text#${item.paragraph.id}`} key={`${item.work.id}-${item.paragraph.id}`}><div className="result-meta"><span>{item.work.edition}</span><span>{item.paragraph.id}</span><span>score {item.score}</span></div><h3>{item.work.title}</h3><p className="pali">{item.paragraph.pali}</p><p>{item.paragraph.english}</p><p className="bangla">{item.paragraph.bangla}</p><span className="card-link">Inspect source record →</span></Link>)}</div>{dictionaryMatches.length > 0 && <><div className="section-heading"><div><p className="eyebrow">LEXICAL EVIDENCE</p><h2>Dictionary matches</h2></div></div><div className="grid">{dictionaryMatches.map((item) => <Link className="card" href={`/dictionary/${item.slug}/`} key={item.id}><h3 className="pali">{item.headword}</h3><p>{item.meanings[0]?.english}</p><p className="bangla">{item.meanings[0]?.bangla}</p></Link>)}</div></>}</div>} {submitted && !results.length && <div className="notice"><strong>No supporting passage was found.</strong> The current dataset does not contain a source record matching “{submitted}”.</div>}<div className="notice compact"><strong>Grounding policy:</strong> {policy.rules.join(" ")}</div></section>;
}
