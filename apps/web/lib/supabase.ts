import { createBrowserClient } from "@supabase/ssr";
import type { Session, User } from "@supabase/supabase-js";
import { supabaseBrowserClient, supabaseConfigured } from "./supabaseBrowser";
import type { Permission, UserRole } from "./authz";

export type AuthUser = User;
export type AuthSession = Session;

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  locale: string;
  is_public: boolean;
  interface_language: string;
  public_profile: boolean;
  preferences: Record<string, unknown>;
  contributor_handle?: string | null;
  account_status?: "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
  suspension_reason?: string | null;
  last_seen_at?: string | null;
};

export type ProfileUpdate = Pick<
  Profile,
  | "display_name"
  | "avatar_url"
  | "bio"
  | "locale"
  | "is_public"
  | "interface_language"
  | "public_profile"
  | "preferences"
  | "contributor_handle"
>;

export { supabaseConfigured };
export type { Permission, PermissionKey, UserRole, UserRoleName } from "./authz";

function client() {
  return supabaseBrowserClient();
}

function assertSession(session: AuthSession) {
  if (!session?.user?.id) throw new Error("A signed-in Supabase session is required.");
}

export function getFallbackName(email?: string): string {
  if (!email) return "Researcher";
  const username = email.split("@")[0] || "";
  if (username.length > 10) return `${username.slice(0, 5)}...${username.slice(-4)}`;
  return username || "Researcher";
}

export async function signIn(email: string, password: string) {
  if (!supabaseConfigured) throw new Error("Supabase is not configured.");
  const { data, error } = await client().auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.session) throw new Error("Sign-in succeeded without a usable session.");
  return data.session;
}

export async function signUp(email: string, password: string, displayName?: string) {
  if (!supabaseConfigured) throw new Error("Supabase is not configured.");
  const { data, error } = await client().auth.signUp({
    email,
    password,
    options: { data: displayName ? { display_name: displayName } : undefined },
  });
  if (error) throw error;
  return { session: data.session, user: data.user };
}

export async function refreshAuthSession(session: AuthSession) {
  assertSession(session);
  const { data, error } = await client().auth.refreshSession({ refresh_token: session.refresh_token });
  if (error) throw error;
  if (!data.session) throw new Error("Session refresh returned no usable session.");
  return data.session;
}

export async function getCurrentUser(session: AuthSession) {
  assertSession(session);
  const { data, error } = await client().auth.getUser(session.access_token);
  if (error) throw error;
  return data.user;
}

export async function signOut(session: AuthSession | null) {
  if (!supabaseConfigured) return;
  const { error } = await client().auth.signOut();
  if (error && session) throw error;
}

export async function getProfile(session: AuthSession) {
  assertSession(session);
  const { data, error } = await client()
    .from("profiles")
    .select("id,display_name,avatar_url,bio,locale,is_public,interface_language,public_profile,preferences,contributor_handle,account_status,suspension_reason,last_seen_at")
    .eq("id", session.user.id)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function upsertProfile(session: AuthSession, profile: ProfileUpdate) {
  assertSession(session);
  const { data, error } = await client()
    .from("profiles")
    .upsert({ id: session.user.id, ...profile }, { onConflict: "id" })
    .select("id,display_name,avatar_url,bio,locale,is_public,interface_language,public_profile,preferences,contributor_handle,account_status,suspension_reason,last_seen_at")
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function getUserRoles(session: AuthSession): Promise<UserRole[]> {
  assertSession(session);
  const { data: assignments, error: assignmentError } = await client()
    .from("user_roles")
    .select("role_id")
    .eq("user_id", session.user.id);
  if (assignmentError) throw assignmentError;
  const roleIds = Array.from(new Set((assignments ?? []).map((row) => row.role_id).filter(Boolean)));
  if (!roleIds.length) return [];
  const { data, error } = await client()
    .from("roles")
    .select("id,name,description")
    .in("id", roleIds);
  if (error) throw error;
  return (data ?? []) as UserRole[];
}

export async function getUserPermissions(session: AuthSession): Promise<Permission[]> {
  assertSession(session);
  const { data: assignments, error: assignmentError } = await client()
    .from("user_roles")
    .select("role_id")
    .eq("user_id", session.user.id);
  if (assignmentError) throw assignmentError;
  const roleIds = Array.from(new Set((assignments ?? []).map((row) => row.role_id).filter(Boolean)));
  if (!roleIds.length) return [];

  const { data: mappings, error: mappingError } = await client()
    .from("role_permissions")
    .select("permission_id")
    .in("role_id", roleIds);
  if (mappingError) throw mappingError;
  const permissionIds = Array.from(new Set((mappings ?? []).map((row) => row.permission_id).filter(Boolean)));
  if (!permissionIds.length) return [];

  const { data, error } = await client()
    .from("permissions")
    .select("id,key,description")
    .in("id", permissionIds);
  if (error) throw error;
  return (data ?? []) as Permission[];
}

export type EditorialSubmission = {
  id: string;
  contributor_id: string;
  target_id: string;
  kind: string;
  title: string;
  body: string;
  status: "DRAFT" | "SUBMITTED" | "IN_REVIEW" | "CHANGES_REQUESTED" | "APPROVED" | "PUBLISHED" | "REJECTED";
  created_at: string;
  updated_at: string;
};

export async function createEditorialSubmission(
  session: AuthSession,
  submission: Pick<EditorialSubmission, "target_id" | "kind" | "title" | "body">,
) {
  assertSession(session);
  const { data, error } = await client()
    .from("editorial_submissions")
    .insert({ contributor_id: session.user.id, ...submission })
    .select("id,contributor_id,target_id,kind,title,body,status,created_at,updated_at")
    .single();
  if (error) throw error;
  return data as EditorialSubmission;
}

export type WorkspaceSnapshot = {
  state: unknown;
  schema_version: number;
  updated_at: string;
};

export async function getWorkspaceSnapshot(session: AuthSession) {
  assertSession(session);
  const { data, error } = await client()
    .from("workspace_snapshots")
    .select("state,schema_version,updated_at")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (error) throw error;
  return data as WorkspaceSnapshot | null;
}

export async function saveWorkspaceSnapshot(session: AuthSession, state: unknown) {
  assertSession(session);
  const { data, error } = await client()
    .from("workspace_snapshots")
    .upsert({ user_id: session.user.id, state, schema_version: 2 }, { onConflict: "user_id" })
    .select("state,schema_version,updated_at")
    .single();
  if (error) throw error;
  return data as WorkspaceSnapshot;
}

export type AdminProfile = Profile & { email?: string | null };

export async function listAdminProfiles(session: AuthSession) {
  assertSession(session);
  const { data, error } = await client()
    .from("profiles")
    .select("id,display_name,avatar_url,bio,locale,is_public,interface_language,public_profile,preferences,contributor_handle,account_status,suspension_reason,last_seen_at,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as AdminProfile[];
}

export async function adminAssignRole(session: AuthSession, userId: string, roleName: string) {
  assertSession(session);
  const { error } = await client().rpc("admin_assign_role", { p_user_id: userId, p_role_name: roleName });
  if (error) throw error;
}

export async function adminRevokeRole(session: AuthSession, userId: string, roleName: string) {
  assertSession(session);
  const { error } = await client().rpc("admin_revoke_role", { p_user_id: userId, p_role_name: roleName });
  if (error) throw error;
}

export async function adminSetAccountStatus(session: AuthSession, userId: string, status: Profile["account_status"], reason?: string) {
  assertSession(session);
  const { error } = await client().rpc("admin_set_account_status", {
    p_user_id: userId,
    p_status: status,
    p_reason: reason ?? null,
  });
  if (error) throw error;
}

export async function listAdminAuditLogs(session: AuthSession) {
  assertSession(session);
  const { data, error } = await client()
    .from("audit_logs")
    .select("id,actor_id,action,entity_type,entity_id,old_value,new_value,reason,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}

export type EditorialSubmissionRecord = EditorialSubmission;

export async function listEditorialSubmissions(session: AuthSession) {
  assertSession(session);
  const { data, error } = await client()
    .from("editorial_submissions")
    .select("id,contributor_id,target_id,kind,title,body,status,created_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as EditorialSubmissionRecord[];
}

export async function reviewEditorialSubmission(session: AuthSession, submissionId: string, decision: "APPROVE" | "REQUEST_CHANGES" | "REJECT" | "COMMENT", note?: string) {
  assertSession(session);
  const { data, error } = await client().rpc("editorial_review_submission", {
    p_submission_id: submissionId,
    p_decision: decision,
    p_note: note ?? null,
  });
  if (error) throw error;
  return data as EditorialSubmissionRecord;
}

export async function listAdminUserRoles(session: AuthSession) {
  assertSession(session);
  const { data, error } = await client()
    .from("user_roles")
    .select("user_id,role_id,assigned_at,assigned_by")
    .order("assigned_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  return data ?? [];
}
