"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { getProfile, upsertProfile, getFallbackName, type Profile } from "../lib/supabase";
import { supabaseBrowserClient } from "../lib/supabaseBrowser";
import { useAuth } from "./AuthProvider";
import { normalizeAvatarGender, UserAvatar } from "./UserAvatar";

function describeSupabaseError(value: unknown, fallback: string): string {
  if (value instanceof Error && value.message) return value.message;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const parts = [record.code, record.message, record.details, record.hint].filter((part): part is string => typeof part === "string" && Boolean(part));
    if (parts.length) return parts.join(" — ");
  }
  return fallback;
}

function stringPreference(profile: Profile | null, key: string): string | null {
  const value = profile?.preferences?.[key];
  return typeof value === "string" ? value : null;
}

async function compressAvatar(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const maxDimension = 512;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare the profile image for compression.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const compressed = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
    if (!compressed) throw new Error("Image compression failed. Try another image format.");
    if (compressed.size > 500 * 1024) throw new Error("The compressed avatar is still larger than 500 KB. Choose a simpler or smaller image.");
    return compressed;
  } finally {
    bitmap.close();
  }
}

export default function AccountPanel() {
  const { configured, loading, session, user, roles, permissions, authorizationError, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [locale, setLocale] = useState("en");
  const [gender, setGender] = useState("neutral");
  const [isPublic, setIsPublic] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (!session) return;
    let active = true;
    setProfileLoading(true);
    getProfile(session).then((value) => {
      if (!active) return;
      setProfile(value);
      const meta = user?.user_metadata || {};
      setDisplayName(value?.display_name ?? (typeof meta.display_name === "string" ? meta.display_name : typeof meta.full_name === "string" ? meta.full_name : typeof meta.name === "string" ? meta.name : ""));
      setBio(value?.bio ?? "");
      setLocale(value?.interface_language ?? value?.locale ?? "en");
      setGender(normalizeAvatarGender(stringPreference(value, "gender") ?? meta.gender));
      setIsPublic(value?.public_profile ?? value?.is_public ?? false);
    }).catch((value) => {
      if (active) setError(describeSupabaseError(value, "Could not load profile. Check that Supabase migrations are applied and the profiles SELECT policy is active."));
    }).finally(() => { if (active) setProfileLoading(false); });
    return () => { active = false; };
  }, [session, user]);

  const email = user?.email ?? "";
  const avatarUrl = profile?.avatar_url ?? (typeof user?.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null);
  const displayLabel = displayName.trim() || getFallbackName(email);
  const effectiveGender = useMemo(() => normalizeAvatarGender(gender), [gender]);

  if (loading) return <div className="notice">Loading account…</div>;
  if (!configured) return <div className="notice">Supabase is not configured. Your workspace remains local-first.</div>;
  if (!session || !user) return <div className="notice"><strong>You are not signed in.</strong> <Link href="/auth/">Sign in</Link> to enable cloud workspace sync.</div>;

  const activeSession = session;
  // Capture the narrowed authenticated user for nested async/event handlers.
  const activeUser = user;

  function cancelEditing() {
    const meta = activeUser.user_metadata || {};
    setDisplayName(profile?.display_name ?? (typeof meta.display_name === "string" ? meta.display_name : typeof meta.full_name === "string" ? meta.full_name : typeof meta.name === "string" ? meta.name : ""));
    setBio(profile?.bio ?? "");
    setLocale(profile?.interface_language ?? profile?.locale ?? "en");
    setGender(normalizeAvatarGender(stringPreference(profile, "gender") ?? meta.gender));
    setIsPublic(profile?.public_profile ?? profile?.is_public ?? false);
    setIsEditing(false); setError(""); setStatus("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus(""); setError("");
    try {
      const next = await upsertProfile(activeSession, {
        display_name: displayName.trim() || null,
        avatar_url: avatarUrl,
        bio: bio.trim() || null,
        locale,
        is_public: isPublic,
        interface_language: locale,
        public_profile: isPublic,
        preferences: { ...(profile?.preferences ?? {}), gender },
        contributor_handle: profile?.contributor_handle ?? null,
      });
      setProfile(next); setIsEditing(false); setStatus("Profile saved successfully.");
    } catch (value) {
      setError(describeSupabaseError(value, "Could not save profile. Check the profiles columns, INSERT/UPDATE policies, and applied migrations."));
    }
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(""); setStatus("");
    if (!file.type.startsWith("image/")) { setError("Choose a supported image file (JPEG, PNG, WebP, or GIF)."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Choose an image smaller than 10 MB before compression."); return; }
    setIsUploading(true);
    try {
      // Decode and resize on-device; upload only the compressed WebP output, not the original file.
      const compressedFile = await compressAvatar(file);
      const path = `${activeUser.id}/avatar.webp`;
      const storage = supabaseBrowserClient().storage.from("avatars");
      const { error: uploadError } = await storage.upload(path, compressedFile, { upsert: true, contentType: "image/webp", cacheControl: "0" });
      if (uploadError) throw uploadError;
      const { data } = storage.getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?v=${Date.now()}`;
      setProfile((current) => current ? { ...current, avatar_url: publicUrl } : current);
      const next = await upsertProfile(activeSession, {
        display_name: displayName.trim() || null, avatar_url: publicUrl, bio: bio.trim() || null,
        locale, is_public: isPublic, interface_language: locale, public_profile: isPublic,
        preferences: { ...(profile?.preferences ?? {}), gender }, contributor_handle: profile?.contributor_handle ?? null,
      });
      setProfile(next);
      // Keep the lightweight avatar metadata in the auth session synchronized so all avatar links update immediately.
      const { error: metadataError } = await supabaseBrowserClient().auth.updateUser({ data: { avatar_url: publicUrl, gender } });
      if (metadataError) throw metadataError;
      setStatus("Profile picture uploaded and saved.");
    } catch (value) {
      setError(describeSupabaseError(value, "Could not upload the picture. Apply the avatar storage migration and check the avatars bucket policies."));
    } finally { setIsUploading(false); }
  }

  const permissionDescriptions: Record<string, string> = {
    "content.read": "Read published texts and research content", "content.create": "Submit new content for review", "content.edit": "Edit content within assigned scope", "content.review": "Review submissions and proposed changes", "content.publish": "Publish approved content", "content.delete": "Delete content where authorized", "dictionary.read": "Read dictionary entries", "dictionary.edit": "Edit dictionary entries", "media.create": "Add media records", "media.edit": "Edit media metadata", "media.delete": "Remove media records", "user.read": "View user and profile records", "user.edit": "Edit permitted user profile fields", "user.suspend": "Suspend or restore accounts", "role.assign": "Assign or revoke roles", "comment.moderate": "Moderate user comments", "source.manage": "Manage source provenance", "license.manage": "Manage license metadata", "audit.read": "Read administrative audit history"
  };

  async function requestAccountDeletion() {
    if (deleteConfirmation.trim() !== "DELETE") { setError("Type DELETE exactly to confirm account deletion."); return; }
    setIsDeletingAccount(true); setError(""); setStatus("");
    try {
      const { data, error: invokeError } = await supabaseBrowserClient().functions.invoke("delete-account", { body: { confirmation: "DELETE" } });
      if (invokeError) throw invokeError;
      if (!data?.deleted) throw new Error("The deletion service did not confirm account deletion. Your account has not been signed out automatically; contact the administrator before retrying.");
      await signOut();
      setStatus("Your account was deleted. You have been signed out.");
    } catch (value) {
      setError(describeSupabaseError(value, "Account deletion failed. Confirm that the delete-account Edge Function is deployed and configured."));
    } finally { setIsDeletingAccount(false); }
  }

  return <div className="account-grid">
    <section className="card account-card account-summary-card">
      <span className="card-kicker">ACCOUNT</span>
      <div className="account-identity">
        <UserAvatar src={avatarUrl} gender={effectiveGender} name={displayLabel} size="large" href="/account/" />
        <div className="account-identity-copy"><h2>{displayLabel}</h2><p>{email}</p><span className="account-status-label">{profile?.account_status ?? "Account status unavailable"}</span></div>
      </div>
      <div className="account-access-block">
        <h3>Roles</h3>
        {roles.length ? <div className="role-chip-list">{roles.map((role) => <span className="role-chip" key={role.id}>{role.name}</span>)}</div> : <p className="muted">{authorizationError ? "Role information could not be loaded." : "READER role pending or not assigned."}</p>}
        <div className="permission-heading"><h3>Permissions <span className="count-chip">{permissions.length}</span></h3><button className="button compact-button" type="button" aria-expanded={showPermissions} onClick={() => setShowPermissions((value) => !value)}>{showPermissions ? "Hide permissions" : "Show permissions"}</button></div>
        {showPermissions && (permissions.length ? <ul className="permission-list">{permissions.map((permission) => <li key={permission.key}><strong>{permission.key}</strong><span>{permissionDescriptions[permission.key] ?? "Authorized action defined by this project"}</span></li>)}</ul> : <p className="muted">No effective permissions are currently available.</p>)}
      </div>
      {authorizationError && <div className="notice error-notice" role="alert">Could not load role/permission data: {authorizationError}. Verify migrations, role assignments, and RLS policies.</div>}
      <div className="actions"><Link className="button primary" href="/workspace/">Open workspace</Link><Link className="button" href="/dashboard/">Dashboard</Link><button className="button" type="button" onClick={() => void signOut()}>Sign out</button></div>
    </section>

    <section className="card account-card profile-editor-card">
      <div className="profile-heading"><div><span className="card-kicker">PROFILE</span><h2>Profile details</h2></div><button className="button" type="button" onClick={() => { if (isEditing) cancelEditing(); else { setIsEditing(true); setError(""); setStatus(""); } }}>{isEditing ? "Cancel editing" : "Edit profile"}</button></div>
      {profileLoading ? <p className="muted">Loading profile details…</p> : isEditing ? <form className="auth-form" onSubmit={save}>
        <div className="avatar-edit-row"><UserAvatar src={avatarUrl} gender={effectiveGender} name={displayLabel} size="large" /><label className="avatar-upload-label"><span>Profile picture</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={uploadAvatar} disabled={isUploading} /><small>JPEG, PNG, WebP or GIF · resized and compressed to WebP before upload (maximum 10 MB source)</small>{isUploading && <small role="status">Uploading picture…</small>}</label></div>
        <label><span>Display name</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={120} /></label>
        <label><span>Bio</span><textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} maxLength={1000} /></label>
        <label><span>Interface language</span><select value={locale} onChange={(event) => setLocale(event.target.value)}><option value="en">English</option><option value="bn">বাংলা</option><option value="pi">Pāḷi</option></select></label>
        <label><span>Gender</span><select value={gender} onChange={(event) => setGender(event.target.value)}><option value="neutral">Not specified / neutral</option><option value="female">Female</option><option value="male">Male</option></select></label>
        <label className="checkbox-row"><input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} /><span>Make my profile publicly discoverable</span></label>
        {error && <div className="notice error-notice" role="alert">{error}</div>}{status && <div className="notice success-notice" role="status">{status}</div>}
        <button className="button primary" type="submit">Save profile</button>
      </form> : <div className="profile-readonly">
        <div><span>Display name</span><strong>{displayLabel}</strong></div>
        <div><span>Email</span><strong>{email}</strong></div>
        <div><span>Bio</span><p>{bio || "No biography added."}</p></div>
        <div><span>Interface language</span><strong>{locale === "bn" ? "বাংলা" : locale === "pi" ? "Pāḷi" : "English"}</strong></div>
        <div><span>Gender</span><strong>{gender === "female" ? "Female" : gender === "male" ? "Male" : "Not specified"}</strong></div>
        <div><span>Profile visibility</span><strong>{isPublic ? "Publicly discoverable" : "Private"}</strong></div>
        {error && <div className="notice error-notice" role="alert">{error}</div>}{status && <div className="notice success-notice" role="status">{status}</div>}
      </div>}
      <section className="account-danger-zone" aria-labelledby="delete-account-heading">
        <h3 id="delete-account-heading">Delete account</h3>
        <p>Deleting your account is permanent. You may lose access to your profile, cloud workspace, saved research, and role assignments. This does not delete public corpus content or audit records where retention is legally or operationally required. Export any data you need before proceeding.</p>
        <label htmlFor="delete-account-confirmation">Type <strong>DELETE</strong> to confirm</label>
        <input id="delete-account-confirmation" value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} autoComplete="off" disabled={isDeletingAccount} />
        <button className="button danger-button" type="button" disabled={isDeletingAccount || deleteConfirmation.trim() !== "DELETE"} onClick={() => void requestAccountDeletion()}>{isDeletingAccount ? "Deleting account…" : "Permanently delete my account"}</button>
        <p className="muted">If the deletion service is not deployed, the request will fail safely and your account will remain intact.</p>
      </section>
    </section>
  </div>;
}
