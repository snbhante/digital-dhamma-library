"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createId,
  readWorkspace,
  targetIdForParagraph,
  writeWorkspace,
  emptyWorkspace,
  type WorkspaceState,
} from "../lib/workspace";

type Props = {
  workId: string;
  workTitle: string;
  paragraphId: string;
};

function StarIcon() { return <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/></svg>; }
function StarFilledIcon() { return <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/></svg>; }
function EditIcon() { return <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m14 5 5 5M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/></svg>; }

export default function ParagraphResearchTools({ workId, workTitle, paragraphId }: Props) {
  const targetId = targetIdForParagraph(workId, paragraphId);
  const [state, setState] = useState<WorkspaceState>(emptyWorkspace);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const refresh = () => setState(readWorkspace());
    refresh();
    window.addEventListener("ddl-workspace-updated", refresh);
    return () => window.removeEventListener("ddl-workspace-updated", refresh);
  }, []);

  const existingNote = useMemo(
    () => state.notes.find((item) => item.targetId === targetId),
    [state.notes, targetId],
  );

  const bookmarked = useMemo(
    () => state.bookmarks.some((item) => item.targetId === targetId),
    [state.bookmarks, targetId],
  );

  useEffect(() => {
    setNote(existingNote?.body ?? "");
  }, [existingNote?.body, targetId]);

  useEffect(() => {
    if (!noteOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => textareaRef.current?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNoteOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [noteOpen]);

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

  function openNote() {
    setNote(existingNote?.body ?? "");
    setNoteOpen(true);
  }

  function saveNote() {
    const body = note.trim();
    let next: WorkspaceState;

    if (!body) {
      next = { ...state, notes: state.notes.filter((item) => item.targetId !== targetId) };
    } else if (existingNote) {
      next = {
        ...state,
        notes: state.notes.map((item) =>
          item.targetId === targetId
            ? { ...item, body, updatedAt: new Date().toISOString() }
            : item,
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

  function deleteNote() {
    if (!existingNote) return;
    const next = { ...state, notes: state.notes.filter((item) => item.targetId !== targetId) };
    setState(next);
    writeWorkspace(next);
    setNoteOpen(false);
  }

  return (
    <>
      <div className="paragraph-action-items">
        <button
          className="small-button"
          type="button"
          onClick={toggleBookmark}
          aria-pressed={bookmarked}
        >
          {bookmarked ? <><StarFilledIcon /> Saved</> : <><StarIcon /> Save</>}
        </button>
        <button className="small-button" type="button" onClick={openNote}>
          {existingNote ? <><EditIcon /> Edit note</> : <><EditIcon /> Note</>}
        </button>
      </div>

      {noteOpen && (
        <div
          className="note-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setNoteOpen(false);
          }}
        >
          <section
            className="note-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`note-title-${paragraphId}`}
          >
            <div className="note-dialog-head">
              <div>
                <p className="eyebrow">PRIVATE RESEARCH NOTE</p>
                <h2 id={`note-title-${paragraphId}`}>Note for {paragraphId}</h2>
                <p className="note-dialog-context">{workTitle}</p>
              </div>
              <button
                className="icon-button"
                type="button"
                onClick={() => setNoteOpen(false)}
                aria-label="Close note editor"
              >
                ×
              </button>
            </div>

            <label className="note-dialog-field">
              <span>Research note</span>
              <textarea
                ref={textareaRef}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={8}
                placeholder="Write a private research note about this paragraph…"
              />
            </label>

            <div className="note-dialog-actions">
              {existingNote && (
                <button className="small-button danger-button" type="button" onClick={deleteNote}>
                  Delete note
                </button>
              )}
              <span className="note-dialog-spacer" />
              <button className="small-button" type="button" onClick={() => setNoteOpen(false)}>
                Cancel
              </button>
              <button className="small-button primary-small-button" type="button" onClick={saveNote}>
                Save note
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
