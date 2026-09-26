"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Recent = { workId: string; title: string; collection: string; visitedAt: string };
const KEY = "ddl-recent-reads:v1";

export default function RecentReads() {
  const [items, setItems] = useState<Recent[]>([]);

  useEffect(() => {
    try {
      const value = JSON.parse(window.localStorage.getItem(KEY) || "[]") as Recent[];
      setItems(Array.isArray(value) ? value.slice(0, 5) : []);
    } catch {
      setItems([]);
    }
  }, []);

  if (!items.length) return null;
  return <section className="section compact-section"><div className="section-heading"><div><p className="eyebrow">LOCAL READING HISTORY</p><h2>Continue reading</h2></div><span className="badge">Last 5 works</span></div><div className="grid">{items.map((item) => <Link className="card" href={`/read/${item.workId}/`} key={item.workId}><span className="card-kicker">{item.collection}</span><h3>{item.title}</h3><p>Last opened {new Date(item.visitedAt).toLocaleString()}</p><span className="card-link">Continue →</span></Link>)}</div></section>;
}

export function rememberRecentRead(item: Omit<Recent, "visitedAt">) {
  if (typeof window === "undefined") return;
  try {
    const current = JSON.parse(window.localStorage.getItem(KEY) || "[]") as Recent[];
    const next = [{ ...item, visitedAt: new Date().toISOString() }, ...current.filter((entry) => entry.workId !== item.workId)].slice(0, 5);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}
