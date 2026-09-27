"use client";

import { useEffect, useState } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function ProtocolHandler() {
  const [value, setValue] = useState("");
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("url") ?? "";
    setValue(raw);
  }, []);

  return <main id="main-content" className="shell compact-section">
    <nav className="topbar"><a href={`${BASE_PATH}/`}>← Digital Dhamma Library</a><span>Protocol Handler</span></nav>
    <section className="reader-header">
      <p className="eyebrow">PWA PROTOCOL HANDLER</p>
      <h1>Open a Dhamma reference</h1>
      <p>The <code>web+dhamma:</code> link below was received by the installed application.</p>
      <div className="notice"><strong>Received:</strong><br />{value || "No protocol URL supplied."}</div>
      <div className="actions"><a className="button primary" href={value && value.startsWith("https://") ? value : `${BASE_PATH}/search/`}>Continue</a><a className="button" href={`${BASE_PATH}/`}>Return to library</a></div>
    </section>
  </main>;
}
