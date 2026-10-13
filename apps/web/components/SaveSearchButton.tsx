"use client";

import { useState } from "react";
import { createId, readWorkspace, writeWorkspace } from "../lib/workspace";

export default function SaveSearchButton({
  query,
  field,
  collection,
  type,
  language,
  limit,
}: {
  query: string;
  field: string;
  collection: string;
  type: string;
  language: string;
  limit: string;
}) {
  const [isNaming, setIsNaming] = useState(false);
  const [name, setName] = useState(query || "Research search");
  const [message, setMessage] = useState("");

  function save() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setMessage("Enter a name for this saved search.");
      return;
    }

    try {
      const state = readWorkspace();
      const next = {
        ...state,
        savedSearches: [
          {
            id: createId("search"),
            name: trimmedName,
            query,
            field,
            collection,
            type,
            language,
            limit,
            createdAt: new Date().toISOString(),
          },
          ...state.savedSearches,
        ],
      };
      writeWorkspace(next);
      setIsNaming(false);
      setMessage(`Saved search: ${trimmedName}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save this search.");
    }
  }

  return (
    <div className="save-search-control">
      {!isNaming ? (
        <button
          className="small-button"
          type="button"
          onClick={() => {
            setName(query || "Research search");
            setMessage("");
            setIsNaming(true);
          }}
        >
          Save this search
        </button>
      ) : (
        <form
          className="save-search-form"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <label>
            Name this saved search
            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={120}
              required
            />
          </label>
          <button className="small-button" type="submit">Save</button>
          <button className="small-button" type="button" onClick={() => setIsNaming(false)}>
            Cancel
          </button>
        </form>
      )}
      {message ? <p role="status" aria-live="polite">{message}</p> : null}
    </div>
  );
}
