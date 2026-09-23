import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell not-found">
      <p className="eyebrow">404</p>
      <h1>Text not found</h1>
      <p>The requested Dhamma record is not present in the current published corpus.</p>
      <div className="actions">
        <Link className="button primary" href="/">Return to library</Link>
        <Link className="button" href="/search/">Search corpus</Link>
      </div>
    </main>
  );
}
