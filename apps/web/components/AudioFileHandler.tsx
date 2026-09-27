"use client";

import { useEffect, useState } from "react";

type LaunchFile = { getFile: () => Promise<File> };
type LaunchParams = { files?: LaunchFile[] };
type LaunchQueue = { setConsumer: (consumer: (params: LaunchParams) => void) => void };

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function AudioFileHandler() {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("Waiting for an audio file launched from the operating system…");
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const queue = (window as unknown as { launchQueue?: LaunchQueue }).launchQueue;
    if (!queue) {
      setMessage("This browser does not expose the Launch Handler API. You can still use the library normally.");
      return;
    }
    queue.setConsumer(async (params) => {
      const incoming = await Promise.all((params.files ?? []).map((entry) => entry.getFile()));
      setFiles(incoming);
      setMessage(incoming.length ? `${incoming.length} audio file(s) received.` : "No audio file was supplied.");
    });
  }, []);

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const file of files) next[`${file.name}-${file.lastModified}`] = URL.createObjectURL(file);
    setAudioUrls(next);
    return () => Object.values(next).forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  return <main id="main-content" className="shell compact-section">
    <nav className="topbar"><a href={`${BASE_PATH}/`}>← Digital Dhamma Library</a><span>Audio File Handler</span></nav>
    <section className="reader-header">
      <p className="eyebrow">PWA FILE HANDLER</p>
      <h1>Open an audio resource</h1>
      <p>{message}</p>
    </section>
    <section className="grid">{files.map((file) => {
      const key = `${file.name}-${file.lastModified}`;
      return <article className="card" key={key}><span className="card-kicker">AUDIO</span><h3>{file.name}</h3><audio controls src={audioUrls[key]} preload="metadata" /><p>{file.type || "Unknown audio type"} · {Math.round(file.size / 1024)} KB</p></article>;
    })}</section>
    <div className="actions"><a className="button primary" href={`${BASE_PATH}/`}>Return to library</a></div>
  </main>;
}
