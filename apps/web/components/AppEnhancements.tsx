"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AppEnhancements() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("ddl-theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    const nextDark = saved ? saved === "dark" : prefersDark;
    setDark(nextDark);
    document.documentElement.dataset.theme = nextDark ? "dark" : "light";

    if ("serviceWorker" in navigator) {
      const base = window.location.pathname.startsWith("/digital-dhamma-library") ? "/digital-dhamma-library/" : "/";
      navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        router.push("/search/");
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    window.localStorage.setItem("ddl-theme", next ? "dark" : "light");
  }

  const commands = [
    ["Search the Dhamma", "/search/"],
    ["My workspace", "/workspace/"],
    ["Research Workbench", "/research/"],
    ["Browse works", "/works/"],
    ["Dictionary", "/dictionary/"],
  ] as const;

  return <>
    <div className="global-tools" aria-label="Application tools">
      <button className="small-button" onClick={() => setOpen(true)} title="Command palette (Ctrl+K)">⌘K</button>
      <button className="small-button" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">{dark ? "☀" : "☾"}</button>
    </div>
    {open && <div className="command-overlay" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="command-panel">
        <div className="command-head"><strong>Go to…</strong><button className="small-button" onClick={() => setOpen(false)}>Esc</button></div>
        <p className="muted">Press <kbd>Ctrl</kbd> + <kbd>K</kbd> anytime to open this palette. Press <kbd>/</kbd> to jump to search.</p>
        <div className="command-list">{commands.map(([label, href]) => <button key={href} className="command-item" onClick={() => { setOpen(false); router.push(href); }}><span>{label}</span><span>→</span></button>)}</div>
        <p className="command-current">Current: {pathname}</p>
      </div>
    </div>}
  </>;
}
