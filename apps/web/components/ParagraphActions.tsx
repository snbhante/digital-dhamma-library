"use client";

import type { ReactNode } from "react";

type Props = {
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export default function ParagraphActions({ open, onToggle, children }: Props) {
  return (
    <div className={`paragraph-actions${open ? " is-open" : ""}`}>
      <button
        className="paragraph-action-trigger"
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Show paragraph actions"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
      >
        <span aria-hidden="true">⋯</span>
        <span>Actions</span>
      </button>
      <div
        className="paragraph-action-panel"
        role="group"
        aria-label="Paragraph actions"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
