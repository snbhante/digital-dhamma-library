"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createId, readWorkspace, writeWorkspace } from "../lib/workspace";

export default function SaveSearchButton({ query, field, collection, type, language, limit }: {
  query: string; field: string; collection: string; type: string; language: string; limit: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(query || "Research search");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) { setMessage("Enter a name for this saved search."); return; }
    try {
      const state = readWorkspace();
      writeWorkspace({ ...state, savedSearches: [{ id: createId("search"), name: trimmedName, query, field, collection, type, language, limit, createdAt: new Date().toISOString() }, ...state.savedSearches] });
      setIsOpen(false);
      setMessage(`Saved search: ${trimmedName}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save this search.");
    }
  }

  return <div className="save-search-control">
    <button className="small-button" type="button" onClick={() => { setName(query || "Research search"); setMessage(""); setIsOpen(true); }}>Save this search</button>
    {message && <p role="status" aria-live="polite">{message}</p>}
    {isOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="save-search-title">
        <div className="modal-heading"><div><p className="eyebrow">PERSONAL WORKSPACE</p><h2 id="save-search-title">Save this search</h2></div><button type="button" className="icon-button" onClick={() => setIsOpen(false)} aria-label="Close dialog">×</button></div>
        <p className="muted">Save the query and its current filters to your local research workspace.</p>
        <form className="auth-form" onSubmit={save}>
          <label><span>Saved search name</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required /></label>
          <div className="modal-summary"><strong>Query:</strong> {query}<br /><strong>Filters:</strong> {field}, {collection}, {type}, {language}; limit {limit}</div>
          {message && <p role="alert">{message}</p>}
          <div className="modal-actions"><button className="button primary" type="submit">Save search</button><button className="button" type="button" onClick={() => setIsOpen(false)}>Cancel</button></div>
        </form>
      </section>
    </div>}
  </div>;
}
