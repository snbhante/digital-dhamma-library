"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import CopyCitationButton from "./CopyCitationButton";

type Paragraph = { id: string; number: number; pali: string; english?: string; bangla?: string };
type Work = { id: string; title: string; edition: string; paragraphs: Paragraph[] };

export default function ReaderView({ work }: { work: Work }) {
  const [showPali, setShowPali] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [showBangla, setShowBangla] = useState(true);
  const [scale, setScale] = useState(1);
  const [lineHeight, setLineHeight] = useState(1.95);

  useEffect(() => {
    const saved = window.localStorage.getItem("ddl-reader-settings");
    if (!saved) return;
    try {
      const value = JSON.parse(saved) as Partial<{ showPali: boolean; showEnglish: boolean; showBangla: boolean; scale: number; lineHeight: number }>;
      if (typeof value.showPali === "boolean") setShowPali(value.showPali);
      if (typeof value.showEnglish === "boolean") setShowEnglish(value.showEnglish);
      if (typeof value.showBangla === "boolean") setShowBangla(value.showBangla);
      if (typeof value.scale === "number") setScale(value.scale);
      if (typeof value.lineHeight === "number") setLineHeight(value.lineHeight);
    } catch {}
  }, []);

  useEffect(() => {
    window.localStorage.setItem("ddl-reader-settings", JSON.stringify({ showPali, showEnglish, showBangla, scale, lineHeight }));
  }, [showPali, showEnglish, showBangla, scale, lineHeight]);

  const paragraphStyle = useMemo(() => ({ "--reader-scale": scale, "--reader-line-height": lineHeight } as CSSProperties), [scale, lineHeight]);

  return <>
    <div className="reader-tools" aria-label="Reader controls">
      <div className="tool-group"><strong>Languages</strong>
        <label><input type="checkbox" checked={showPali} onChange={(e) => setShowPali(e.target.checked)} /> Pāḷi</label>
        <label><input type="checkbox" checked={showEnglish} onChange={(e) => setShowEnglish(e.target.checked)} /> English</label>
        <label><input type="checkbox" checked={showBangla} onChange={(e) => setShowBangla(e.target.checked)} /> বাংলা</label>
      </div>
      <div className="tool-group"><strong>Text</strong><button className="small-button" onClick={() => setScale((v) => Math.max(.85, Number((v - .1).toFixed(2))))}>A−</button><button className="small-button" onClick={() => setScale(1)}>A</button><button className="small-button" onClick={() => setScale((v) => Math.min(1.3, Number((v + .1).toFixed(2))))}>A+</button><button className="small-button" onClick={() => setLineHeight((v) => Math.min(2.4, Number((v + .15).toFixed(2))))}>Line+</button><button className="small-button" onClick={() => setLineHeight((v) => Math.max(1.5, Number((v - .15).toFixed(2))))}>Line−</button></div>
    </div>

    <section className="text-column" aria-label={`${work.title} text`} style={paragraphStyle}>
      {work.paragraphs.map((paragraph) => <article className="paragraph" id={paragraph.id} key={paragraph.id}>
        <div className="paragraph-head"><div className="paragraph-id">{paragraph.id}</div><CopyCitationButton workTitle={work.title} paragraphId={paragraph.id} edition={work.edition} /></div>
        {showPali && <p className="pali reader-pali">{paragraph.pali}</p>}
        {showEnglish && paragraph.english && <p className="translation">{paragraph.english}</p>}
        {showBangla && paragraph.bangla && <p className="translation bangla">{paragraph.bangla}</p>}
        <div className="citation"><span>{work.edition}</span><span>•</span><a href={`#${paragraph.id}`}>#{paragraph.number}</a></div>
      </article>)}
    </section>
  </>;
}
