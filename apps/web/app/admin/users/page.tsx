import Link from "next/link";
import { RoleGate } from "../../../components/AccessGate";

export default function AdminUsersPage() {
  return <main id="main-content" className="shell"><nav className="topbar"><Link href="/admin/">← Administration</Link><span>Users</span></nav><header className="reader-header"><p className="eyebrow">USER ADMINISTRATION</p><h1>Users</h1><p>The database foundation supports profile lifecycle, suspension, role assignment, and audit logging. Full user listing/actions will be expanded through the authenticated admin API/RLS surface.</p></header><RoleGate permissions={["user.read"]}><section className="section"><div className="notice">User records are protected by Supabase RLS. This static-hosted release intentionally does not expose privileged service-role credentials to the browser.</div></section></RoleGate></main>;
}
