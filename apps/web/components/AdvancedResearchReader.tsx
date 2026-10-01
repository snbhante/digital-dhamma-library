"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import corpus from "../../../data/corpus.json";
import dictionary from "../../../data/dictionary.json";
import crossReferences from "../../../data/cross-references.json";
import commentaries from "../../../data/commentaries.json";
import witnesses from "../../../data/edition-witnesses.json";
import citationProfiles from "../../../data/citation-profiles.json";
import ParagraphResearchTools from "./ParagraphResearchTools";
import CopyCitationButton from "./CopyCitationButton";

type Work = (typeof corpus)[number];
type Tab = "text" | "translation" | "commentary" | "dictionary" | "notes" | "related";

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/[ṃṁ]/g, "ṃ");
}

function termsFromPali(value: string) {
  return value.split(/[^\p{L}\p{M}āīūṅñṭḍṇḷṃṁ’'-]+/u).map((item) => normalize(item).replace(/^['-]+|['-]+$/g, "")).filter((item) => item.length >= 3);
}

export default function AdvancedResearchReader({ work }: { work: Work }) {
  const paragraphs = useMemo(() => Array.from(new Map(work.paragraphs.map((p) => [p.id, p])).values()), [work.paragraphs]);
  const [activeId, setActiveId] = useState(paragraphs[0]?.id ?? "");
  const [tab, setTab] = useState<Tab>("text");
  const [translation, setTranslation] = useState<"English" | "বাংলা">("English");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showPali, setShowPali] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("p");
    const requestedTab = params.get("tab") as Tab | null;
    if (requested && paragraphs.some((p) => p.id === requested)) setActiveId(requested);
    if (requestedTab && ["text", "translation", "commentary", "dictionary", "notes", "related"].includes(requestedTab)) setTab(requestedTab);
  }, [paragraphs]);

  useEffect(() => {
    if (!activeId) return;
    const params = new URLSearchParams(window.location.search);
    params.set("p", activeId);
    params.set("tab", tab);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}#${activeId}`);
  }, [activeId, tab]);

  const active = paragraphs.find((p) => p.id === activeId) ?? paragraphs[0];
  const dictionaryMatches = useMemo(() => {
    if (!active) return [];
    const terms = new Set(termsFromPali(active.pali));
    return dictionary.filter((entry) => {
      const candidates = [entry.headword, ...entry.variants].map(normalize);
      return candidates.some((candidate) => terms.has(candidate) || [...terms].some((term) => candidate.startsWith(term) || term.startsWith(candidate)));
    }).slice(0, 8);
  }, [active]);

  const related = useMemo(() => crossReferences.filter((item) => item.from === work.id || item.to === work.id).slice(0, 12), [work.id]);
  const workWitnesses = witnesses.filter((item) => item.workId === work.id);
  const bundledWitness = workWitnesses.find((item) => item.textStatus === "BUNDLED");
  const hasAlternate = workWitnesses.some((item) => item.role !== "ALTERNATE_TEMPLATE" && item.textStatus !== "BUNDLED");
  const citationProfile = citationProfiles.find((item) => item.id === "plain") ?? citationProfiles[0];

  function openParagraph(id: string) {
    setActiveId(id);
    setDrawerOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const tabs: Array<[Tab, string]> = [
    ["text", "Text"],
    ["translation", "Translation"],
    ["commentary", "Commentary"],
    ["dictionary", "Dictionary"],
    ["notes", "Notes"],
    ["related", "Related"],
  ];

  return <div className="advanced-reader">
    <div className="advanced-reader-toolbar">
      <div>
        <p className="eyebrow">RESEARCH READER 1.0</p>
        <strong>{work.title}</strong>
      </div>
      <div className="reader-actions">
        <Link className="small-button" href={`/read/${work.id}/`}>Classic reader</Link>
        <button className="small-button" type="button" onClick={() => setDrawerOpen(true)}>Research panel</button>
      </div>
    </div>

    <div className="advanced-reader-layout">
      <aside className={`research-sidebar${drawerOpen ? " is-open" : ""}`} aria-label="Research navigation">
        <div className="research-sidebar-head"><strong>Paragraphs</strong><button className="small-button mobile-only" onClick={() => setDrawerOpen(false)}>Close</button></div>
        <label className="sidebar-toggle"><input type="checkbox" checked={showPali} onChange={(e) => setShowPali(e.target.checked)} /> Show Pāḷi in text view</label>
        <div className="paragraph-index">{paragraphs.map((paragraph) => <button key={paragraph.id} className={active?.id === paragraph.id ? "is-active" : ""} onClick={() => openParagraph(paragraph.id)}><span>{paragraph.number}</span><span>{paragraph.id}</span></button>)}</div>
        <div className="notice compact"><strong>Witness:</strong> {bundledWitness?.editionLabel ?? work.edition}<br />{hasAlternate ? "Verified alternate witness available." : "No verified alternate witness text is bundled yet."}</div>
      </aside>

      <main className="research-reader-main">
        <div className="research-tabs" role="tablist" aria-label="Research views">{tabs.map(([id, label]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "is-active" : ""} onClick={() => setTab(id)}>{label}</button>)}</div>

        {active && <article className="research-focus" id={`focus-${active.id}`}>
          <div className="research-focus-head"><div><span className="paragraph-id">{active.id}</span><h2>Paragraph {active.number}</h2></div><div className="reader-actions"><CopyCitationButton workTitle={work.title} paragraphId={active.id} edition={work.edition} /><ParagraphResearchTools workId={work.id} workTitle={work.title} paragraphId={active.id} /></div></div>

          {tab === "text" && <div className="research-pane parallel-pane">
            {showPali && <section><span className="pane-label">PĀḶI</span><p className="pali research-pali">{active.pali}</p></section>}
            <section><span className="pane-label">{translation.toUpperCase()}</span><p className={translation === "বাংলা" ? "bangla" : ""}>{translation === "English" ? active.english ?? "—" : active.bangla ?? "—"}</p></section>
            <div className="translation-switch"><button className={`small-button ${translation === "English" ? "is-active" : ""}`} onClick={() => setTranslation("English")}>English</button><button className={`small-button ${translation === "বাংলা" ? "is-active" : ""}`} onClick={() => setTranslation("বাংলা")}>বাংলা</button></div>
          </div>}

          {tab === "translation" && <div className="research-pane"><div className="parallel-grid"><section className="card"><span className="card-kicker">ENGLISH</span><p>{active.english ?? "No English translation attached."}</p></section><section className="card"><span className="card-kicker">বাংলা</span><p className="bangla">{active.bangla ?? "কোনো বাংলা অনুবাদ সংযুক্ত নেই।"}</p></section></div><div className="notice compact">Alignment status: starter paragraph-level 1:1 alignment. Sentence-level alignment must be reviewed before scholarly publication.</div></div>}

          {tab === "commentary" && <div className="research-pane"><div className="section-heading"><div><p className="eyebrow">AṬṬHAKATHĀ / ṬĪKĀ</p><h3>Commentary layer</h3></div><span className="badge">source-aware</span></div><div className="grid">{commentaries.map((item) => <article className="card" key={item.id}><span className="card-kicker">{item.type}</span><h3>{item.title}</h3><p>{item.note}</p><p className="muted">{item.licenseStatus}</p></article>)}</div><div className="notice compact"><strong>Integrity boundary:</strong> no commentary passage is being invented or silently attributed. This release provides the reader layer and registry; verified commentary text must be imported with source, edition, license, stable segment ID, and citation metadata.</div></div>}

          {tab === "dictionary" && <div className="research-pane"><div className="section-heading"><div><p className="eyebrow">LEXICAL SIDE PANEL</p><h3>Dictionary matches</h3></div><span className="badge">{dictionaryMatches.length}</span></div>{dictionaryMatches.length ? <div className="result-list">{dictionaryMatches.map((entry) => <Link className="result-card" href={`/dictionary/${entry.slug}/`} key={entry.id}><div className="result-meta"><span>{entry.grammar}</span><span>{entry.slug}</span></div><h3 className="pali">{entry.headword}</h3><p>{entry.meanings[0]?.english}</p><p className="bangla">{entry.meanings[0]?.bangla}</p><span className="card-link">Open dictionary entry →</span></Link>)}</div> : <div className="notice">No dictionary match is confidently attached to this paragraph's token forms in the starter lexical index.</div>}</div>}

          {tab === "notes" && <div className="research-pane"><ParagraphResearchTools workId={work.id} workTitle={work.title} paragraphId={active.id} /></div>}

          {tab === "related" && <div className="research-pane"><div className="section-heading"><div><p className="eyebrow">KNOWLEDGE GRAPH</p><h3>Related records</h3></div><Link className="small-button" href="/knowledge-graph/">Open graph</Link></div>{related.length ? <div className="result-list">{related.map((item) => { const target = item.from === work.id ? item.to : item.from; const targetWork = corpus.find((candidate) => candidate.id === target); return <Link className="result-card" key={item.id} href={`/research-reader/${target}/`}><div className="result-meta"><span>{item.relation}</span><span>{target}</span></div><h3>{targetWork?.title ?? target}</h3><p>{item.note}</p><span className="card-link">Open related research reader →</span></Link>; })}</div> : <div className="notice">No curated cross-reference is registered for this work.</div>}<div className="notice compact"><strong>Primary citation:</strong> {citationProfile?.label ?? "Project citation profile"}. Use the paragraph citation tools for reproducible stable references.</div></div>}
        </article>}
      </main>
    </div>
  </div>;
}
