"use client";

import { useState } from "react";

type Props = {
  workTitle: string;
  paragraphId: string;
  edition: string;
};

export default function CopyCitationButton({ workTitle, paragraphId, edition }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyCitation() {
    const url = `${window.location.origin}${window.location.pathname}#${paragraphId}`;
    const citation = `${workTitle}, ${paragraphId} (${edition}) — ${url}`;

    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copy this citation:", citation);
    }
  }

  return (
    <button className="text-button" type="button" onClick={copyCitation}>
      {copied ? "Copied" : "Copy citation"}
    </button>
  );
}
