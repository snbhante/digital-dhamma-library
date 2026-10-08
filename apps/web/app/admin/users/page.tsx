"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RoleGate } from "../../../components/AccessGate";
import { useAuth } from "../../../components/AuthProvider";
import {
  adminAssignRole,
  adminRevokeRole,
  adminSetAccountStatus,
  listAdminProfiles,
  listAdminUserRoles,
  type AdminProfile,
  type Permission,
} from "../../../lib/supabase";
import { USER_ROLES } from "../../../lib/authz";

type Assignment = {
  user_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by: string | null;
};

export default function AdminUsersPage() {
  const { session, roles, permissions } = useAuth();

  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  async function load() {
    if (!session) return;

    const [nextUsers, nextAssignments] = await Promise.all([
      listAdminProfiles(session),
      listAdminUserRoles(session),
    ]);

    setUsers(nextUsers);
    setAssignments(nextAssignments);
  }

  useEffect(() => {
    void load().catch((value) => {
      setError(
        value instanceof Error
          ? value.message
          : "Could not load users.",
      );
    });
  }, [session]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users.filter((user) => {
      return (
        !q ||
        `${user.display_name ?? ""} ${
          user.contributor_handle ?? ""
        } ${user.id}`
          .toLowerCase()
          .includes(q)
      );
    });
  }, [users, query]);

  /*
   * Keep the permission check aligned with the central Permission
   * type instead of widening the RBAC boundary to arbitrary strings.
   */
  const canAssign = permissions.includes(
    "role.assign" as unknown as Permission,
  );

  async function changeRole(
    userId: string,
    role: string,
    action: "assign" | "revoke",
  ) {
    if (!session) return;

    setBusy(`${action}:${userId}:${role}`);
    setError("");

    try {
      if (action === "assign") {
        await adminAssignRole(session, userId, role);
      } else {
        await adminRevokeRole(session, userId, role);
      }

      await load();
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : "Role operation failed.",
      );
    } finally {
      setBusy("");
    }
  }

  async function changeStatus(
    userId: string,
    status: AdminProfile["account_status"],
  ) {
    if (!session) return;

    setBusy(`status:${userId}`);
    setError("");

    try {
      await adminSetAccountStatus(session, userId, status);
      await load();
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : "Account status update failed.",
      );
    } finally {
      setBusy("");
    }
  }

  return (
    <main id="main-content" className="shell">
      <nav className="topbar">
        <Link href="/admin/">← Administration</Link>
        <span>Users</span>
      </nav>

      <header className="reader-header">
        <p className="eyebrow">
          USER ADMINISTRATION · PHASE 4.3
        </p>

        <h1>Users &amp; account lifecycle</h1>

        <p>
          Administrative operations are executed through
          RLS-protected Supabase RPCs; no service-role or secret
          key is exposed to this static client.
        </p>
      </header>

      <RoleGate permissions={["user.read"]}>
        <section className="section">
          <div className="search-form large">
            <input
              aria-label="Search users"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search display name, handle, or user ID…"
            />

            <button
              className="small-button"
              type="button"
              onClick={() => void load()}
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="notice error-notice">
              {error}
            </div>
          )}

          <div className="result-list">
            {filtered.map((user) => {
              const roleIds = assignments
                .filter((a) => a.user_id === user.id)
                .map((a) => a.role_id);

              return (
                <article className="card" key={user.id}>
                  <div className="result-meta">
                    <span>
                      {user.account_status ?? "ACTIVE"}
                    </span>

                    <span>
                      {user.contributor_handle
                        ? `@${user.contributor_handle}`
                        : "No contributor handle"}
                    </span>
                  </div>

                  <h2>
                    {user.display_name ||
                      "Unnamed researcher"}
                  </h2>

                  <p className="muted">{user.id}</p>

                  <p>
                    Assigned role IDs: {roleIds.length || 0}
                  </p>

                  {canAssign && (
                    <div className="actions">
                      {USER_ROLES.filter(
                        (role) =>
                          role !== "GUEST" &&
                          role !== "READER",
                      ).map((role) => {
                        const roleId = assignments.find(
                          (a) => a.user_id === user.id,
                        )?.role_id;

                        const key = role.toLowerCase();

                        return (
                          <button
                            className="small-button"
                            key={key}
                            type="button"
                            disabled={Boolean(busy)}
                            title={
                              roleId
                                ? `Assign ${role}`
                                : undefined
                            }
                            onClick={() =>
                              void changeRole(
                                user.id,
                                role,
                                "assign",
                              )
                            }
                          >
                            {busy ===
                            `assign:${user.id}:${role}`
                              ? "…"
                              : `+ ${role}`}
                          </button>
                        );
                      })}

                      {roles.some(
                        (r) => r.name === "SUPER_ADMIN",
                      ) && (
                        <button
                          className="small-button"
                          type="button"
                          disabled={Boolean(busy)}
                          onClick={() =>
                            void changeStatus(
                              user.id,
                              user.account_status ===
                                "SUSPENDED"
                                ? "ACTIVE"
                                : "SUSPENDED",
                            )
                          }
                        >
                          {busy ===
                          `status:${user.id}`
                            ? "…"
                            : user.account_status ===
                                "SUSPENDED"
                              ? "Reactivate"
                              : "Suspend"}
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </RoleGate>
    </main>
  );
}
