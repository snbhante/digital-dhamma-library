"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

const areas = [
  ["/admin/users/", "Users", "Account status, profiles, and future moderation controls.", "user.read"],
  ["/admin/roles/", "Roles & permissions", "Assign canonical roles and inspect effective permissions.", "role.assign"],
  ["/admin/audit/", "Audit history", "Review authenticated administrative actions and editorial events.", "audit.read"],
  ["/editorial/", "Contributions", "Contributor submissions and editorial workflow.", "content.review"],
  ["/media/", "Media registry", "Audio, video, image, document, and external media metadata.", "media.edit"],
  ["/sources/", "Sources & licenses", "Source provenance and rights metadata.", "source.manage"],
] as const;

export default function AdminPanel() {
  const { permissions } = useAuth();
  const allowed = new Set(permissions.map((item) => item.key));
  const visible = areas.filter(([, , , permission]) => allowed.has(permission));
  return <section className="section"><div className="grid dashboard-grid">
    {visible.map(([href, title, description]) => <Link className="card" href={href} key={href}><span className="card-kicker">ADMIN</span><h2>{title}</h2><p>{description}</p><span className="card-link">Open →</span></Link>)}
  </div>{visible.length === 0 && <div className="notice">Your account is authenticated but no administrative permission is currently visible.</div>}</section>;
}
