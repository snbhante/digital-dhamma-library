"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress({ workId }: { workId: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const key = `ddl-reading-progress:${workId}`;
    const saved = Number(window.localStorage.getItem(key) || 0);
    if (Number.isFinite(saved)) setProgress(Math.max(0, Math.min(100, saved)));

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value = max <= 0 ? 100 : (window.scrollY / max) * 100;
      const next = Math.max(0, Math.min(100, value));
      setProgress(next);
      window.localStorage.setItem(key, String(Math.round(next)));
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [workId]);

  return <div className="reading-progress" aria-label={`Reading progress ${Math.round(progress)} percent`}><div style={{ width: `${progress}%` }} /></div>;
}
