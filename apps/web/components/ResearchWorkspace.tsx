"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { emptyWorkspace, readWorkspace, writeWorkspace, type WorkspaceState } from "../lib/workspace";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function ResearchWorkspace() {
  const [state, setState] = useState<WorkspaceState>(emptyWorkspace);
  const [ready, setReady] = useState(false);
  const [collectionName, setCollectionName] = useState("");

  useEffect(() => {
    const refresh = () => setState(readWorkspace());
    refresh();
    setReady(true);
    window.addEventListener("ddl-workspace-updated", refresh);
    return () => window.removeEventListener("ddl-workspace-updated", refresh);
  }, []);

  const bookmarkIds = useMemo(() => new Set(state.bookmarks.map((item) => item.id)), [state.bookmarks]);

  function removeBookmark(targetId: string) {
    const next = { ...state, bookmarks: state.bookmarks.filter((item) => item.targetId !== targetId) };
    setState(next);
    writeWorkspace(next);
  }


  function assignBookmark(bookmarkId: string, collectionId: string) {
    const next = {
      ...state,
      collections: state.collections.map((collection) => ({
        ...collection,
        bookmarkIds: collection.id === collectionId
          ? Array.from(new Set([...collection.bookmarkIds, bookmarkId]))
          : collection.bookmarkIds.filter((id) => id !== bookmarkId),
      })),
    };
    setState(next);
    writeWorkspace(next);
  }

  function removeNote(targetId: string) {
    const next = { ...state, notes: state.notes.filter((item) => item.targetId !== targetId) };
    setState(next);
    writeWorkspace(next);
  }

  function removeSearch(id: string) {
    const next = { ...state, savedSearches: state.savedSearches.filter((item) => item.id !== id) };
    setState(next);
    writeWorkspace(next);
  }

  function createCollection() {
    const name = collectionName.trim();
    if (!name) return;
    const next = {
      ...state,
      collections: [
        ...state.collections,
        { id: `collection-${Date.now()}`, name, description: "", bookmarkIds: [], createdAt: new Date().toISOString() },
      ],
    };
    setState(next);
    writeWorkspace(next);
    setCollectionName("");
  }

  function deleteCollection(id: string) {
    const next = { ...state, collections: state.collections.filter((item) => item.id !== id) };
    setState(next);
    writeWorkspace(next);
  }

  function exportWorkspace() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "digital-dhamma-library-workspace.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importWorkspace(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const value = JSON.parse(String(reader.result)) as WorkspaceState;
        if (!value || !Array.isArray(value.bookmarks) || !Array.isArray(value.notes) || !Array.isArray(value.savedSearches) || !Array.isArray(value.collections)) {
          throw new Error("Invalid workspace file");
        }
        setState(value);
        writeWorkspace(value);
      } catch {
        window.alert("This file is not a valid Digital Dhamma Library workspace export.");
      }
    };
    reader.readAsText(file);
  }

  function clearWorkspace() {
    if (!window.confirm("Clear all local bookmarks, notes, saved searches, and collections from this browser?")) return;
    setState(emptyWorkspace);
    writeWorkspace(emptyWorkspace);
  }

  if (!ready) return <div className="notice">Loading your local research workspace…</div>;

  return <div className="workspace-page">
    <section className="workspace-toolbar">
      <div><strong>Local-first workspace</strong><span className="muted">Your current browser data is separate from canonical Git data.</span></div>
      <div className="reader-actions">
        <button className="small-button" type="button" onClick={exportWorkspace}>Export workspace</button>
        <label className="small-button file-button">Import workspace<input type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) importWorkspace(file); event.currentTarget.value = ""; }} /></label>
        <button className="small-button" type="button" onClick={clearWorkspace}>Clear local data</button>
      </div>
    </section>

    <section className="section">
      <div className="section-heading"><div><p className="eyebrow">SAVED PASSAGES</p><h2>Bookmarks <span className="badge">{state.bookmarks.length}</span></h2></div></div>
      {state.bookmarks.length === 0 ? <div className="notice">No saved passages yet. Open a reader and use <strong>☆ Save</strong> beside a paragraph.</div> : <div className="result-list">{state.bookmarks.map((item) => <article className="card workspace-card" key={item.targetId}><div className="result-meta"><span>{item.workId}</span><span>{item.paragraphId}</span><span>{formatDate(item.createdAt)}</span></div><h3>{item.workTitle}</h3><div className="reader-actions"><Link className="small-button" href={`/read/${item.workId}/#${item.paragraphId}`}>Open passage →</Link><label className="small-button">Collection<select className="workspace-select" value={state.collections.find((collection) => collection.bookmarkIds.includes(item.id))?.id ?? ""} onChange={(event) => assignBookmark(item.id, event.target.value)}><option value="">Unassigned</option>{state.collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.name}</option>)}</select></label><button className="small-button" type="button" onClick={() => removeBookmark(item.targetId)}>Remove</button></div></article>)}</div>}
    </section>

    <section className="section">
      <div className="section-heading"><div><p className="eyebrow">PRIVATE RESEARCH NOTES</p><h2>Notes <span className="badge">{state.notes.length}</span></h2></div></div>
      {state.notes.length === 0 ? <div className="notice">No notes yet. Notes are stored locally in this browser until an authenticated persistence layer is connected.</div> : <div className="result-list">{state.notes.map((item) => <article className="card workspace-card" key={item.targetId}><div className="result-meta"><span>{item.workId}</span><span>{item.paragraphId}</span><span>Updated {formatDate(item.updatedAt)}</span></div><h3>{item.workTitle}</h3><p className="workspace-note">{item.body}</p><div className="reader-actions"><Link className="small-button" href={`/read/${item.workId}/#${item.paragraphId}`}>Open passage →</Link><button className="small-button" type="button" onClick={() => removeNote(item.targetId)}>Delete note</button></div></article>)}</div>}
    </section>

    <section className="section">
      <div className="section-heading"><div><p className="eyebrow">RESEARCH QUERIES</p><h2>Saved searches <span className="badge">{state.savedSearches.length}</span></h2></div></div>
      {state.savedSearches.length === 0 ? <div className="notice">No saved searches yet. Run a search and choose <strong>Save this search</strong>.</div> : <div className="result-list">{state.savedSearches.map((item) => { const params = new URLSearchParams({ q: item.query, field: item.field, collection: item.collection, type: item.type, language: item.language, limit: item.limit }); return <article className="card workspace-card" key={item.id}><div className="result-meta"><span>{formatDate(item.createdAt)}</span><span>{item.field}</span></div><h3>{item.name}</h3><p><strong>Query:</strong> {item.query}</p><div className="reader-actions"><Link className="small-button" href={`/search/?${params.toString()}`}>Run search →</Link><button className="small-button" type="button" onClick={() => removeSearch(item.id)}>Remove</button></div></article>; })}</div>}
    </section>

    <section className="section">
      <div className="section-heading"><div><p className="eyebrow">PERSONAL ORGANIZATION</p><h2>Collections <span className="badge">{state.collections.length}</span></h2></div></div>
      <div className="search-form large"><input value={collectionName} onChange={(event) => setCollectionName(event.target.value)} placeholder="New collection name" /><button className="button primary" type="button" onClick={createCollection}>Create collection</button></div>
      {state.collections.length > 0 && <div className="grid workspace-collections">{state.collections.map((collection) => <article className="card workspace-card" key={collection.id}><span className="card-kicker">COLLECTION</span><h3>{collection.name}</h3><p>{collection.bookmarkIds.filter((id) => bookmarkIds.has(id)).length} saved passages assigned</p><button className="small-button" type="button" onClick={() => deleteCollection(collection.id)}>Delete collection</button></article>)}</div>}
    </section>

    <div className="notice"><strong>Persistence roadmap:</strong> this Phase 2.3 workspace is deliberately local-first so it works on GitHub Pages without a server. The existing Supabase schema already contains bookmarks, notes, saved searches, and reading history; Phase 3 authentication can sync this local state to the authenticated database without changing stable text IDs.</div>
  </div>;
}
