import Link from "next/link";
import ResearchWorkspace from "../../components/ResearchWorkspace";
import AuthStatus from "../../components/AuthStatus";

export default function WorkspacePage() {
  return <main id="main-content" className="shell">
    <nav className="topbar"><Link href="/research/">← Research Workbench</Link><span className="topbar-right"><span>My Research Workspace</span><AuthStatus /></span></nav>
    <header className="reader-header">
      <p className="eyebrow">PHASE 3 · WORKSPACE 2.0</p>
      <h1>My Research Workspace</h1>
      <p>Save passages, private notes, research searches, and personal collections. Work locally first, then synchronize the same workspace to your authenticated cloud account when configured.</p>
    </header>
    <ResearchWorkspace />
  </main>;
}
