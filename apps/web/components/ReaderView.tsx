"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import CopyCitationButton from "./CopyCitationButton";
import CitationTools from "./CitationTools";
import ParagraphResearchTools from "./ParagraphResearchTools";
import ParagraphActions from "./ParagraphActions";

type Paragraph = { id: string; number: number; pali: string; english?: string; bangla?: string };
type Work = { id: string; title: string; edition: string; paragraphs: Paragraph[] };

export default function ReaderView({ work }: { work: Work }) {
  const [showPali, setShowPali] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [showBangla, setShowBangla] = useState(true);
  const [scale, setScale] = useState(1);
  const [lineHeight, setLineHeight] = useState(1.95);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("ddl-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      document.documentElement.dataset.theme = savedTheme;
    } else {
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
      const initialTheme = prefersDark ? "dark" : "light";
      setTheme(initialTheme);
      document.documentElement.dataset.theme = initialTheme;
    }

    const onThemeChanged = (event: Event) => {
      const next = (event as CustomEvent<"light" | "dark">).detail;
      if (next === "light" || next === "dark") setTheme(next);
    };
    window.addEventListener("ddl-theme-changed", onThemeChanged);

    const saved = window.localStorage.getItem("ddl-reader-settings");
    if (!saved) {
      return () => window.removeEventListener("ddl-theme-changed", onThemeChanged);
    }
    try {
      const value = JSON.parse(saved) as Partial<{ showPali: boolean; showEnglish: boolean; showBangla: boolean; scale: number; lineHeight: number }>;
      if (typeof value.showPali === "boolean") setShowPali(value.showPali);
      if (typeof value.showEnglish === "boolean") setShowEnglish(value.showEnglish);
      if (typeof value.showBangla === "boolean") setShowBangla(value.showBangla);
      if (typeof value.scale === "number") setScale(value.scale);
      if (typeof value.lineHeight === "number") setLineHeight(value.lineHeight);
    } catch {}
    return () => window.removeEventListener("ddl-theme-changed", onThemeChanged);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("ddl-reader-settings", JSON.stringify({ showPali, showEnglish, showBangla, scale, lineHeight }));
  }, [showPali, showEnglish, showBangla, scale, lineHeight]);

  const paragraphStyle = useMemo(() => ({ "--reader-scale": scale, "--reader-line-height": lineHeight } as CSSProperties), [scale, lineHeight]);

  function setReaderTheme(next: "light" | "dark") {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("ddl-theme", next);
    window.dispatchEvent(new CustomEvent("ddl-theme-changed", { detail: next }));
  }

  const uniqueParagraphs = useMemo(() => {
    const seen = new Set<string>();
    return work.paragraphs.filter((paragraph) => {
      const key = `${work.id}-${paragraph.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [work.id, work.paragraphs]);

  return <>
    <div className="reader-tools" aria-label="Reader controls">
      <div className="tool-group"><strong>Languages</strong>
        <label><input type="checkbox" checked={showPali} onChange={(e) => setShowPali(e.target.checked)} /> Pāḷi</label>
        <label><input type="checkbox" checked={showEnglish} onChange={(e) => setShowEnglish(e.target.checked)} /> English</label>
        <label><input type="checkbox" checked={showBangla} onChange={(e) => setShowBangla(e.target.checked)} /> বাংলা</label>
      </div>
      <div className="tool-group"><strong>Theme</strong><button className={`small-button ${theme === "light" ? "is-active" : ""}`} type="button" onClick={() => setReaderTheme("light")} aria-pressed={theme === "light"}>Light</button><button className={`small-button ${theme === "dark" ? "is-active" : ""}`} type="button" onClick={() => setReaderTheme("dark")} aria-pressed={theme === "dark"}>Dark</button></div>
      <div className="tool-group"><strong>Text</strong><button className="small-button" onClick={() => setScale((v) => Math.max(.85, Number((v - .1).toFixed(2))))}>A−</button><button className="small-button" onClick={() => setScale(1)}>A</button><button className="small-button" onClick={() => setScale((v) => Math.min(1.3, Number((v + .1).toFixed(2))))}>A+</button><button className="small-button" onClick={() => setLineHeight((v) => Math.min(2.4, Number((v + .15).toFixed(2))))}>Line+</button><button className="small-button" onClick={() => setLineHeight((v) => Math.max(1.5, Number((v - .15).toFixed(2))))}>Line−</button><button className="small-button" onClick={() => { setShowPali(true); setShowEnglish(true); setShowBangla(true); setScale(1); setLineHeight(1.95); }}>Reset</button></div>
    </div>

    <section className="text-column" aria-label={`${work.title} text`} style={paragraphStyle}>
      {uniqueParagraphs.map((paragraph) => <article
        className={`paragraph${activeParagraphId === paragraph.id ? " is-action-target" : ""}`}
        id={paragraph.id}
        key={`${work.id}-${paragraph.id}`}
        onClick={(event) => {
          const target = event.target as HTMLElement;
          if (target.closest("a, button, input, textarea, select, summary, label")) return;
          setActiveParagraphId((current) => current === paragraph.id ? null : paragraph.id);
        }}
      >
        <div className="paragraph-head">
          <div className="paragraph-id">{paragraph.id}</div>
          <ParagraphActions
            open={activeParagraphId === paragraph.id}
            onToggle={() => setActiveParagraphId((current) => current === paragraph.id ? null : paragraph.id)}
          >
            <CopyCitationButton workTitle={work.title} paragraphId={paragraph.id} edition={work.edition} />
            <CitationTools workTitle={work.title} workId={work.id} paragraphId={paragraph.id} edition={work.edition} />
            <ParagraphResearchTools workId={work.id} workTitle={work.title} paragraphId={paragraph.id} />
          </ParagraphActions>
        </div>
        {showPali && <p className="pali reader-pali">{paragraph.pali}</p>}
        {showEnglish && paragraph.english && <p className="translation">{paragraph.english}</p>}
        {showBangla && paragraph.bangla && <p className="translation bangla">{paragraph.bangla}</p>}
        <div className="citation"><span>{work.edition}</span><span>•</span><a href={`#${paragraph.id}`}>#{paragraph.number}</a></div>
      </article>)}
    </section>
  </>;
}
