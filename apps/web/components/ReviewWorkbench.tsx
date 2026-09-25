"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import reviewQueue from "../../../data/review-queue.json";
import sentenceAlignments from "../../../data/sentence-alignments.json";
import morphologyAnalyses from "../../../data/morphology-analyses.json";
import occurrences from "../../../data/occurrences.json";

type Status = "UNREVIEWED" | "NEEDS_REVIEW" | "VERIFIED" | "REJECTED";
type ReviewState = { status: Status; note: string };

const storageKey = "digital-dhamma-library:research-reviews:v0.7.0";

function label(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (char) => char.toUpperCase());
}

export default function ReviewWorkbench() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | Status>("ALL");
  const [type, setType] = useState("ALL");
  const [state, setState] = useState<Record<string, ReviewState>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setState(JSON.parse(raw));
    } catch {
      // Local review state is optional; canonical research data remains immutable.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [ready, state]);

  const records = useMemo(() => {
    const q = query.normalize("NFKC").toLocaleLowerCase().trim();
    return reviewQueue.filter((item) => {
      const current = state[item.id]?.status ?? item.status as Status;
      if (filter !== "ALL" && current !== filter) return false;
      if (type !== "ALL" && item.entityType !== type) return false;
      if (!q) return true;
      return `${item.entityId} ${item.note} ${item.entityType}`.toLocaleLowerCase().includes(q);
    }).slice(0, 120);
  }, [query, filter, type, state]);

  const counts = useMemo(() => {
    const result: Record<Status, number> = { UNREVIEWED: 0, NEEDS_REVIEW: 0, VERIFIED: 0, REJECTED: 0 };
    for (const item of reviewQueue) result[state[item.id]?.status ?? item.status as Status] += 1;
    return result;
  }, [state]);

  function update(itemId: string, next: Partial<ReviewState>) {
    setState((current) => ({
      ...current,
      [itemId]: {
        status: next.status ?? current[itemId]?.status ?? "UNREVIEWED",
        note: next.note ?? current[itemId]?.note ?? ""
      }
    }));
  }

  function details(item: (typeof reviewQueue)[number]) {
    if (item.entityType === "SENTENCE_ALIGNMENT") return sentenceAlignments.find((record) => record.id === item.entityId);
    if (item.entityType === "MORPHOLOGY_ANALYSIS") return morphologyAnalyses.find((record) => record.id === item.entityId);
    return occurrences.find((record) => record.token === item.entityId);
  }

  return <div className="review-workbench">
    <div className="stats-grid">
      {(Object.keys(counts) as Status[]).map((status) => <div className="stat-card" key={status}><strong>{counts[status]}</strong><span>{label(status)}</span></div>)}
    </div>
    <section className="review-controls section">
      <div className="search-form large">
        <input aria-label="Search review queue" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search token, sentence, or review note…" />
        <select aria-label="Review status" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}><option value="ALL">All statuses</option><option value="UNREVIEWED">Unreviewed</option><option value="NEEDS_REVIEW">Needs review</option><option value="VERIFIED">Verified</option><option value="REJECTED">Rejected</option></select>
        <select aria-label="Review entity type" value={type} onChange={(e) => setType(e.target.value)}><option value="ALL">All research types</option><option value="SENTENCE_ALIGNMENT">Sentence alignment</option><option value="OCCURRENCE">Occurrence</option><option value="MORPHOLOGY_ANALYSIS">Morphology analysis</option></select>
      </div>
      <p className="muted">Review decisions are stored locally in this browser in Phase 2.2. Canonical Git data is not modified by this UI.</p>
    </section>
    <section className="result-list">
      {records.map((item) => {
        const detail = details(item) as any;
        const current = state[item.id] ?? { status: item.status as Status, note: "" };
        return <article className="card review-card" key={item.id}>
          <div className="result-meta"><span>{label(item.entityType)}</span><span>{current.status}</span><span>{item.entityId}</span></div>
          {item.entityType === "SENTENCE_ALIGNMENT" && <><p className="pali">{detail?.sourcePali || "No source sentence"}</p><p>{detail?.translationText || "No translation sentence aligned"}</p><Link className="small-button" href={`/read/${detail?.workId}/#${detail?.paragraphId}`}>Open paragraph →</Link></>}
          {item.entityType === "OCCURRENCE" && <><h3 className="pali">{detail?.token}</h3><p><strong>Lemma:</strong> {detail?.lemma || "Not indexed"} · {detail?.count ?? 0} occurrences · {detail?.paragraphCount ?? 0} paragraphs</p><Link className="small-button" href={`/occurrences/?q=${encodeURIComponent(detail?.token ?? "")}`}>Open occurrence index →</Link></>}
          {item.entityType === "MORPHOLOGY_ANALYSIS" && <><h3 className="pali">{detail?.token}</h3><p><strong>Lemma:</strong> {detail?.lemma} · {detail?.grammar || "No grammar note"}</p></>}
          <div className="review-editor">
            <label>Status<select value={current.status} onChange={(e) => update(item.id, { status: e.target.value as Status })}><option value="UNREVIEWED">Unreviewed</option><option value="NEEDS_REVIEW">Needs review</option><option value="VERIFIED">Verified</option><option value="REJECTED">Rejected</option></select></label>
            <label>Reviewer note<textarea value={current.note} onChange={(e) => update(item.id, { note: e.target.value })} placeholder="Record what was checked, why it was accepted/rejected, or what source should be consulted." rows={3} /></label>
          </div>
        </article>;
      })}
    </section>
  </div>;
}
