"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createId,
  readWorkspace,
  targetIdForParagraph,
  writeWorkspace,
  type WorkspaceState,
} from "../lib/workspace";

type Props = {
  workId: string;
  workTitle: string;
  paragraphId: string;
};

export default function ParagraphResearchTools({ workId, workTitle, paragraphId }: Props) {
  const targetId = targetIdForParagraph(workId, paragraphId);
  const [state, setState] = useState<WorkspaceState>(() => readWorkspace());
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    const refresh = () => setState(readWorkspace());
    window.addEventListener("ddl-workspace-updated", refresh);
    return () => window.removeEventListener("ddl-workspace-updated", refresh);
  }, []);

  const bookmarked = useMemo(
    () => state.bookmarks.some((item) => item.targetId === targetId),
    [state.bookmarks, targetId],
  );

  useEffect(() => {
    const existing = state.notes.find((item) => item.targetId === targetId);
    setNote(existing?.body ?? "");
  }, [state.notes, targetId]);

  function toggleBookmark() {
    const next: WorkspaceState = {
      ...state,
      bookmarks: bookmarked
        ? state.bookmarks.filter((item) => item.targetId !== targetId)
        : [
            {
              id: createId("bookmark"),
              targetId,
              workId,
              paragraphId,
              workTitle,
              label: `${workTitle} · ${paragraphId}`,
              createdAt: new Date().toISOString(),
            },
            ...state.bookmarks,
          ],
    };
    setState(next);
    writeWorkspace(next);
  }

  function saveNote() {
    const body = note.trim();
    let next: WorkspaceState;
    const existing = state.notes.find((item) => item.targetId === targetId);
    if (!body) {
      next = { ...state, notes: state.notes.filter((item) => item.targetId !== targetId) };
    } else if (existing) {
      next = {
        ...state,
        notes: state.notes.map((item) =>
          item.targetId === targetId ? { ...item, body, updatedAt: new Date().toISOString() } : item,
        ),
      };
    } else {
      const now = new Date().toISOString();
      next = {
        ...state,
        notes: [
          {
            id: createId("note"),
            targetId,
            workId,
            paragraphId,
            workTitle,
            body,
            createdAt: now,
            updatedAt: now,
          },
          ...state.notes,
        ],
      };
    }
    setState(next);
    writeWorkspace(next);
    setNoteOpen(false);
  }

  return <div className="paragraph-research-tools">
    <button className="text-button" type="button" onClick={toggleBookmark} aria-pressed={bookmarked}>
      {bookmarked ? "★ Saved" : "☆ Save"}
    </button>
    <button className="text-button" type="button" onClick={() => setNoteOpen((value) => !value)}>
      {state.notes.some((item) => item.targetId === targetId) ? "✎ Edit note" : "✎ Note"}
    </button>
    {noteOpen && <div className="paragraph-note-editor">
      <label>
        <span className="sr-only">Research note</span>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Add a private research note…" />
      </label>
      <div className="reader-actions">
        <button className="small-button" type="button" onClick={saveNote}>Save note</button>
        <button className="small-button" type="button" onClick={() => setNoteOpen(false)}>Cancel</button>
      </div>
    </div>}
  </div>;
}
