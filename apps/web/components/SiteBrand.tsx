import Link from "next/link";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function SiteBrand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className={`site-brand${compact ? " site-brand-compact" : ""}`} aria-label="Digital Dhamma Library home">
    <img src={`${BASE_PATH}/assets/branding/logo.svg`} alt="" width="42" height="42" />
    <span><strong>Digital Dhamma Library</strong>{!compact && <small>Read · Search · Study · Research</small>}</span>
  </Link>;
}
