"use client";

import { useEffect, useState } from "react";

interface StoredShare {
  id: number;
  title?: string;
  text?: string;
  url?: string;
  files: File[];
}

function readShare(id: number): Promise<StoredShare | null> {
  return new Promise((resolve) => {
    const request = indexedDB.open("digital-dhamma-library", 1);
    request.onerror = () => resolve(null);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("shares")) {
        db.createObjectStore("shares", { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("shares", "readonly");
      const get = tx.objectStore("shares").get(id);
      get.onerror = () => resolve(null);
      get.onsuccess = () => resolve(get.result ? { ...get.result, id } : null);
    };
  });
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function ShareTargetReceiver() {
  const [share, setShare] = useState<StoredShare | null>(null);
  const [status, setStatus] = useState("Waiting for shared content…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawId = params.get("id");
    const parsed = rawId ? Number(rawId) : NaN;

    if (params.get("error") === "1") {
      setStatus("The shared content could not be stored in this browser.");
      return;
    }

    if (!Number.isFinite(parsed)) {
      setStatus("No shared item was supplied.");
      return;
    }

    readShare(parsed).then((value) => {
      if (!value) {
        setStatus("The shared item is no longer available in this browser.");
        return;
      }
      setShare(value);
      setStatus("Shared content received.");
    });
  }, []);

  return (
    <main id="main-content" className="shell compact-section">
      <nav className="topbar">
        <a href={`${BASE_PATH}/`}>← Digital Dhamma Library</a>
        <span>Share Target</span>
      </nav>
      <section className="reader-header">
        <p className="eyebrow">PWA SHARE TARGET</p>
        <h1>Shared Dhamma resource</h1>
        <p>{status}</p>
      </section>
      {share && (
        <section className="grid">
          {share.title && (
            <article className="card">
              <span className="card-kicker">TITLE</span>
              <h3>{share.title}</h3>
            </article>
          )}
          {share.text && (
            <article className="card">
              <span className="card-kicker">TEXT</span>
              <p className="workspace-note">{share.text}</p>
            </article>
          )}
          {share.url && (
            <article className="card">
              <span className="card-kicker">URL</span>
              <p>
                <a href={share.url} target="_blank" rel="noreferrer">
                  {share.url}
                </a>
              </p>
            </article>
          )}
          {share.files.length > 0 && (
            <article className="card">
              <span className="card-kicker">FILES</span>
              <h3>{share.files.length} file(s)</h3>
              <ul>
                {share.files.map((file) => (
                  <li key={`${file.name}-${file.size}-${file.lastModified}`}>
                    {file.name} · {file.type || "unknown type"}
                  </li>
                ))}
              </ul>
            </article>
          )}
        </section>
      )}
      <div className="actions">
        <a className="button primary" href={`${BASE_PATH}/`}>Return to library</a>
        <a className="button" href={`${BASE_PATH}/search/`}>Search shared content</a>
      </div>
    </main>
  );
}
