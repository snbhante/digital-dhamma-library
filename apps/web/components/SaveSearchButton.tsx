"use client";

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
  function save() {
    const name = window.prompt("Name this saved search", query || "Research search");
    if (!name?.trim()) return;
    const state = readWorkspace();
    const next = {
      ...state,
      savedSearches: [
        {
          id: createId("search"),
          name: name.trim(),
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
  }

  return <button className="small-button" type="button" onClick={save}>Save this search</button>;
}
