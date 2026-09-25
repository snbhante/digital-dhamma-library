"use client";

import { useEffect, useMemo, useState } from "react";
import profiles from "../../../data/citation-profiles.json";

type Props = { workTitle: string; workId: string; paragraphId: string; edition: string };

function pageUrl(workId: string, paragraphId: string) {
  return `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ""}/read/${workId}/#${paragraphId}`;
}

function applyTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);
}

export default function CitationTools({ workTitle, workId, paragraphId, edition }: Props) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    setUrl(pageUrl(workId, paragraphId));
  }, [workId, paragraphId]);

  const values = useMemo(() => {
    const base = {
      workTitle,
      workId,
      paragraphId,
      edition,
      url,
      year: "2026",
      key: `${workId}_${paragraphId}`.replace(/[^a-z0-9_]+/gi, "_")
    };
    return Object.fromEntries(profiles.map((profile) => [profile.id, applyTemplate(profile.template, base)]));
  }, [workTitle, workId, paragraphId, edition, url]);

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
    <button className="small-button" onClick={() => copy(values.plain ?? "", "Citation")}>Copy</button>
    <button className="small-button" onClick={() => copy(values.markdown ?? "", "Markdown")}>Markdown</button>
    <button className="small-button" onClick={() => copy(values.bibtex ?? "", "BibTeX")}>BibTeX</button>
    <button className="small-button" onClick={() => copy(values.apa ?? "", "APA")}>APA</button>
    <button className="small-button" onClick={() => copy(values.chicago ?? "", "Chicago")}>Chicago</button>
    {status && <span className="tool-status" role="status">{status}</span>}
  </div>;
}
