import Link from "next/link";
import SiteBrand from "../../components/SiteBrand";
import ResearchAssistant from "../../components/ResearchAssistant";

export default function ResearchAssistantPage() { return <main id="main-content" className="shell"><nav className="topbar"><SiteBrand compact /><div className="topbar-actions"><Link href="/research/">Research</Link><Link href="/search/">Search</Link></div></nav><header className="reader-header"><p className="eyebrow">RESEARCH ASSISTANT FOUNDATION</p><h1>Citation-first research assistant</h1><p>A deterministic evidence retrieval layer for the current public corpus. Future semantic search and RAG can extend this interface without hiding the source record.</p></header><ResearchAssistant /></main>; }
