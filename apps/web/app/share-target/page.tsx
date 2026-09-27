import ShareTargetReceiver from "../../components/ShareTargetReceiver";

// This route must remain statically renderable because the project uses
// Next.js output: "export" for GitHub Pages. The service worker stores the
// incoming POST payload in IndexedDB and redirects here with ?id=...; the
// client component reads that query string after hydration.
export default function ShareTargetPage() {
  return <ShareTargetReceiver />;
}
