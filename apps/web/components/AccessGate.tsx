"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { hasAnyPermission, hasAnyRole, type PermissionKey, type UserRoleName } from "../lib/authz";

export function AuthenticatedGate({ children }: { children: React.ReactNode }) {
  const { loading, session } = useAuth();
  if (loading) return <div className="notice">Checking authentication…</div>;
  if (!session) return <div className="notice"><strong>Authentication required.</strong> <Link href="/auth/">Sign in</Link> to continue.</div>;
  return <>{children}</>;
}

export function RoleGate({ roles, permissions, children }: { roles?: UserRoleName[]; permissions?: PermissionKey[]; children: React.ReactNode }) {
  const { loading, authorizationLoading, session, roles: assignedRoles, permissions: assignedPermissions } = useAuth();
  if (loading || authorizationLoading) return <div className="notice">Checking authorization…</div>;
  if (!session) return <div className="notice"><strong>Authentication required.</strong> <Link href="/auth/">Sign in</Link> to continue.</div>;
  const roleAllowed = roles?.length ? hasAnyRole(assignedRoles, roles) : true;
  const permissionAllowed = permissions?.length ? hasAnyPermission(assignedPermissions, permissions) : true;
  if (!roleAllowed || !permissionAllowed) {
    return <div className="notice"><strong>Additional access is required.</strong><br />Your account is authenticated, but it does not currently have the role/permission required for this area.</div>;
  }
  return <>{children}</>;
}
