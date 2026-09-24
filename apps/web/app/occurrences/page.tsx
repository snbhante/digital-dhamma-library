"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import occurrences from "../../../../data/occurrences.json";

export default function OccurrencesPage() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => { const q=query.normalize("NFKC").toLocaleLowerCase().trim(); if (!q) return occurrences.slice(0,80); return occurrences.filter((item)=>item.token.includes(q)).slice(0,120); }, [query]);
  return <main className="shell"><nav className="topbar"><Link href="/research/">← Research Workbench</Link><span>Occurrences</span></nav><header className="reader-header"><p className="eyebrow">PĀḶI OCCURRENCE INDEX</p><h1>Word Occurrences</h1><p>Exact-token occurrence index generated from the current starter corpus. This is intentionally separate from future lemma-based morphological search.</p><form className="search-form large" onSubmit={(e)=>e.preventDefault()}><label className="sr-only" htmlFor="occurrence-query">Token</label><input id="occurrence-query" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Try: dhamma, nibbāna, satimā…" /></form></header><section className="section grid">{results.map((item)=><article className="card" key={item.token}><div className="result-meta"><span>{item.count} token occurrence{item.count===1?"":"s"} · {item.paragraphCount} paragraph{item.paragraphCount===1?"":"s"}</span></div><h3 className="pali">{item.token}</h3><div className="result-list">{item.references.slice(0,8).map(ref=><Link className="result-card" key={`${ref.workId}-${ref.paragraphId}`} href={`/read/${ref.workId}/#${ref.paragraphId}`}><span>{ref.paragraphId}</span><strong>Open →</strong></Link>)}</div></article>)}</section></main>;
}
