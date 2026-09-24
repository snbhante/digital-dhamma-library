"use client";

import { useEffect, useMemo, useState } from "react";

type Props = { workTitle: string; workId: string; paragraphId: string; edition: string };

function pageUrl(workId: string, paragraphId: string) {
  return `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ""}/read/${workId}/#${paragraphId}`;
}

export default function CitationTools({ workTitle, workId, paragraphId, edition }: Props) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    setUrl(pageUrl(workId, paragraphId));
  }, [workId, paragraphId]);

  const values = useMemo(() => ({
    plain: `${workTitle}, ${paragraphId} (${edition}) — ${url}`,
    markdown: `[${workTitle}, ${paragraphId}](${url}) — ${edition}`,
    bibtex: `@misc{${workId.replace(/[^a-z0-9]+/gi, "_")}_${paragraphId.replace(/[^a-z0-9]+/gi, "_")},\n  title = {${workTitle}},\n  note = {${paragraphId}; ${edition}},\n  url = {${url}}\n}`
  }), [workTitle, workId, paragraphId, edition, url]);

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(`${label} copied`);
    } catch {
      window.prompt(`Copy ${label}:`, value);
      setStatus(`${label} ready`);
    }
    window.setTimeout(() => setStatus(""), 1800);
  }

  return <div className="citation-tools">
    <button className="small-button" onClick={() => copy(values.plain, "Citation")}>Copy</button>
    <button className="small-button" onClick={() => copy(values.markdown, "Markdown")}>Markdown</button>
    <button className="small-button" onClick={() => copy(values.bibtex, "BibTeX")}>BibTeX</button>
    {status && <span className="tool-status" role="status">{status}</span>}
  </div>;
}
