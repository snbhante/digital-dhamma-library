"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadAndMergeWorkspace, syncWorkspace } from "../lib/workspaceSync";
import { emptyWorkspace, readWorkspace, writeWorkspace, type WorkspaceState } from "../lib/workspace";
import { useAuth } from "./AuthProvider";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function ResearchWorkspace() {
  const { configured, loading: authLoading, session, user } = useAuth();
  const [state, setState] = useState<WorkspaceState>(emptyWorkspace);
  const [ready, setReady] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [cloudStatus, setCloudStatus] = useState<"idle" | "loading" | "synced" | "syncing" | "error">("idle");
  const [cloudMessage, setCloudMessage] = useState("");
  const syncTimer = useRef<number | null>(null);
  const cloudReady = useRef(false);
  const latestState = useRef(state);

  useEffect(() => { latestState.current = state; }, [state]);

  useEffect(() => {
    const refresh = () => setState(readWorkspace());
    refresh();
    setReady(true);
    window.addEventListener("ddl-workspace-updated", refresh);
    return () => window.removeEventListener("ddl-workspace-updated", refresh);
  }, []);

  useEffect(() => {
    if (!ready || authLoading || !session) {
      cloudReady.current = false;
      if (!session) setCloudStatus("idle");
      return;
    }
    let cancelled = false;
    setCloudStatus("loading");
    setCloudMessage("Checking cloud workspace…");
    loadAndMergeWorkspace(session, readWorkspace()).then((merged) => {
      if (cancelled) return;
      cloudReady.current = true;
      setState(merged);
      writeWorkspace(merged);
      setCloudStatus("synced");
      setCloudMessage("Local and cloud workspace are synchronized.");
    }).catch((error) => {
      if (cancelled) return;
      cloudReady.current = true;
      setCloudStatus("error");
      setCloudMessage(error instanceof Error ? error.message : "Cloud synchronization failed.");
    });
    return () => { cancelled = true; };
  }, [ready, authLoading, session?.user.id]);

  useEffect(() => {
    if (!session) return;
    const schedule = () => {
      if (!cloudReady.current) return;
      if (syncTimer.current) window.clearTimeout(syncTimer.current);
      syncTimer.current = window.setTimeout(() => {
        setCloudStatus("syncing");
        syncWorkspace(session, latestState.current).then(() => {
          setCloudStatus("synced");
          setCloudMessage("Cloud workspace updated.");
        }).catch((error) => {
          setCloudStatus("error");
          setCloudMessage(error instanceof Error ? error.message : "Cloud synchronization failed.");
        });
      }, 900);
    };
    window.addEventListener("ddl-workspace-updated", schedule);
    return () => {
      window.removeEventListener("ddl-workspace-updated", schedule);
      if (syncTimer.current) window.clearTimeout(syncTimer.current);
    };
  }, [session?.access_token]);

  const bookmarkIds = useMemo(() => new Set(state.bookmarks.map((item) => item.id)), [state.bookmarks]);

  function commit(next: WorkspaceState) {
    setState(next);
    writeWorkspace(next);
  }

  function removeBookmark(targetId: string) { commit({ ...state, bookmarks: state.bookmarks.filter((item) => item.targetId !== targetId) }); }

  function assignBookmark(bookmarkId: string, collectionId: string) {
    commit({ ...state, collections: state.collections.map((collection) => ({ ...collection, bookmarkIds: collection.id === collectionId ? Array.from(new Set([...collection.bookmarkIds, bookmarkId])) : collection.bookmarkIds.filter((id) => id !== bookmarkId) })) });
  }

  function removeNote(targetId: string) { commit({ ...state, notes: state.notes.filter((item) => item.targetId !== targetId) }); }
  function removeSearch(id: string) { commit({ ...state, savedSearches: state.savedSearches.filter((item) => item.id !== id) }); }

  function createCollection() {
    const name = collectionName.trim();
    if (!name) return;
    commit({ ...state, collections: [...state.collections, { id: `collection-${Date.now()}`, name, description: "", bookmarkIds: [], createdAt: new Date().toISOString() }] });
    setCollectionName("");
  }

  function deleteCollection(id: string) { commit({ ...state, collections: state.collections.filter((item) => item.id !== id) }); }

  function exportWorkspace() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "digital-dhamma-library-workspace-v2.json"; anchor.click(); URL.revokeObjectURL(url);
  }

  function importWorkspace(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const value = JSON.parse(String(reader.result)) as WorkspaceState;
        if (!value || !Array.isArray(value.bookmarks) || !Array.isArray(value.notes) || !Array.isArray(value.savedSearches) || !Array.isArray(value.collections)) throw new Error("Invalid workspace file");
        commit(value);
      } catch { window.alert("This file is not a valid Digital Dhamma Library workspace export."); }
    };
    reader.readAsText(file);
  }

  function clearWorkspace() {
    if (!window.confirm("Clear all local bookmarks, notes, saved searches, and collections from this browser?")) return;
    commit(emptyWorkspace);
  }

  async function manualSync() {
    if (!session) return;
    setCloudStatus("syncing"); setCloudMessage("Uploading current workspace…");
    try {
      await syncWorkspace(session, state);
      setCloudStatus("synced"); setCloudMessage("Cloud workspace updated.");
    } catch (error) {
      setCloudStatus("error"); setCloudMessage(error instanceof Error ? error.message : "Cloud synchronization failed.");
    }
  }

  if (!ready) return <div className="notice">Loading your local research workspace…</div>;

  return <div className="workspace-page">
    <section className="workspace-toolbar">
      <div><strong>{user ? `Signed in as ${user.email || "researcher"}` : "Local-first workspace"}</strong><span className="muted">{user ? "Your workspace is synchronized to your authenticated cloud snapshot." : "Your current browser data is separate from canonical Git data."}</span></div>
      <div className="reader-actions">
        {configured && !user && !authLoading && <Link className="small-button" href="/auth/">Sign in for cloud sync</Link>}
        {user && <button className="small-button" type="button" onClick={manualSync} disabled={cloudStatus === "syncing" || cloudStatus === "loading"}>↻ Sync now</button>}
        <button className="small-button" type="button" onClick={exportWorkspace}>Export workspace</button>
        <label className="small-button file-button">Import workspace<input type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) importWorkspace(file); event.currentTarget.value = ""; }} /></label>
        <button className="small-button" type="button" onClick={clearWorkspace}>Clear local data</button>
      </div>
    </section>

    {user && <div className={`workspace-sync-status ${cloudStatus}`} role="status"><span>{cloudStatus === "synced" ? "●" : cloudStatus === "error" ? "!" : "↻"}</span><strong>{cloudStatus === "synced" ? "Cloud sync active" : cloudStatus === "error" ? "Cloud sync needs attention" : "Cloud sync"}</strong><span>{cloudMessage}</span><Link href="/account/">Account settings →</Link></div>}

    <section className="section"><div className="section-heading"><div><p className="eyebrow">SAVED PASSAGES</p><h2>Bookmarks <span className="badge">{state.bookmarks.length}</span></h2></div></div>{state.bookmarks.length === 0 ? <div className="notice">No saved passages yet. Open a reader and use <strong>☆ Save</strong> beside a paragraph.</div> : <div className="result-list">{state.bookmarks.map((item) => <article className="card workspace-card" key={item.targetId}><div className="result-meta"><span>{item.workId}</span><span>{item.paragraphId}</span><span>{formatDate(item.createdAt)}</span></div><h3>{item.workTitle}</h3><div className="reader-actions"><Link className="small-button" href={`/read/${item.workId}/#${item.paragraphId}`}>Open passage →</Link><label className="small-button">Collection<select className="workspace-select" value={state.collections.find((collection) => collection.bookmarkIds.includes(item.id))?.id ?? ""} onChange={(event) => assignBookmark(item.id, event.target.value)}><option value="">Unassigned</option>{state.collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.name}</option>)}</select></label><button className="small-button" type="button" onClick={() => removeBookmark(item.targetId)}>Remove</button></div></article>)}</div>}</section>

    <section className="section"><div className="section-heading"><div><p className="eyebrow">PRIVATE RESEARCH NOTES</p><h2>Notes <span className="badge">{state.notes.length}</span></h2></div></div>{state.notes.length === 0 ? <div className="notice">No notes yet. Notes are stored locally and, when signed in, synchronized to your private cloud workspace.</div> : <div className="result-list">{state.notes.map((item) => <article className="card workspace-card" key={item.targetId}><div className="result-meta"><span>{item.workId}</span><span>{item.paragraphId}</span><span>Updated {formatDate(item.updatedAt)}</span></div><h3>{item.workTitle}</h3><p className="workspace-note">{item.body}</p><div className="reader-actions"><Link className="small-button" href={`/read/${item.workId}/#${item.paragraphId}`}>Open passage →</Link><button className="small-button" type="button" onClick={() => removeNote(item.targetId)}>Delete note</button></div></article>)}</div>}</section>

    <section className="section"><div className="section-heading"><div><p className="eyebrow">RESEARCH QUERIES</p><h2>Saved searches <span className="badge">{state.savedSearches.length}</span></h2></div></div>{state.savedSearches.length === 0 ? <div className="notice">No saved searches yet. Run a search and choose <strong>Save this search</strong>.</div> : <div className="result-list">{state.savedSearches.map((item) => { const params = new URLSearchParams({ q: item.query, field: item.field, collection: item.collection, type: item.type, language: item.language, limit: item.limit }); return <article className="card workspace-card" key={item.id}><div className="result-meta"><span>{formatDate(item.createdAt)}</span><span>{item.field}</span></div><h3>{item.name}</h3><p><strong>Query:</strong> {item.query}</p><div className="reader-actions"><Link className="small-button" href={`/search/?${params.toString()}`}>Run search →</Link><button className="small-button" type="button" onClick={() => removeSearch(item.id)}>Remove</button></div></article>; })}</div>}</section>

    <section className="section"><div className="section-heading"><div><p className="eyebrow">PERSONAL ORGANIZATION</p><h2>Collections <span className="badge">{state.collections.length}</span></h2></div></div><div className="search-form large"><input value={collectionName} onChange={(event) => setCollectionName(event.target.value)} placeholder="New collection name" /><button className="button primary" type="button" onClick={createCollection}>Create collection</button></div>{state.collections.length > 0 && <div className="grid workspace-collections">{state.collections.map((collection) => <article className="card workspace-card" key={collection.id}><span className="card-kicker">COLLECTION</span><h3>{collection.name}</h3><p>{collection.bookmarkIds.filter((id) => bookmarkIds.has(id)).length} saved passages assigned</p><button className="small-button" type="button" onClick={() => deleteCollection(collection.id)}>Delete collection</button></article>)}</div>}</section>

    <div className="notice"><strong>Workspace 2.0:</strong> the public corpus remains immutable and Git-versioned. Local-first data is preserved under the existing browser storage key; authenticated users can synchronize a versioned private snapshot through Supabase. Cloud synchronization never requires or writes the canonical Dhamma corpus.</div>
  </div>;
}
