import Link from "next/link";
import ResearchWorkspace from "../../components/ResearchWorkspace";

export default function WorkspacePage() {
  return <main className="shell">
    <nav className="topbar"><Link href="/research/">← Research Workbench</Link><span>My Research Workspace</span></nav>
    <header className="reader-header">
      <p className="eyebrow">PHASE 2.3 · PERSONAL RESEARCH</p>
      <h1>My Research Workspace</h1>
      <p>Save passages, private notes, research searches, and personal collections while keeping canonical Buddhist text data immutable.</p>
    </header>
    <ResearchWorkspace />
  </main>;
}
