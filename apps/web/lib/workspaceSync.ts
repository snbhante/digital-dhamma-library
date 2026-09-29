import { getWorkspaceSnapshot, saveWorkspaceSnapshot, type AuthSession } from "./supabase";
import type { WorkspaceState } from "./workspace";

function byTarget<T extends { targetId: string }>(items: T[]) {
  return new Map(items.map((item) => [item.targetId, item]));
}

function mergeWorkspace(local: WorkspaceState, cloud: WorkspaceState): WorkspaceState {
  const bookmarks = Array.from(new Map([...cloud.bookmarks, ...local.bookmarks].map((item) => [item.targetId, item])).values());
  const noteMap = new Map<string, WorkspaceState["notes"][number]>();
  for (const item of [...cloud.notes, ...local.notes]) {
    const previous = noteMap.get(item.targetId);
    if (!previous || new Date(item.updatedAt).getTime() >= new Date(previous.updatedAt).getTime()) noteMap.set(item.targetId, item);
  }
  const searchMap = new Map<string, WorkspaceState["savedSearches"][number]>();
  for (const item of [...cloud.savedSearches, ...local.savedSearches]) searchMap.set(item.id, item);
  const collectionMap = new Map<string, WorkspaceState["collections"][number]>();
  for (const item of [...cloud.collections, ...local.collections]) {
    const key = item.name.trim().toLowerCase();
    const previous = collectionMap.get(key);
    collectionMap.set(key, previous ? { ...previous, ...item, bookmarkIds: Array.from(new Set([...previous.bookmarkIds, ...item.bookmarkIds])) } : item);
  }
  return {
    bookmarks,
    notes: Array.from(noteMap.values()),
    savedSearches: Array.from(searchMap.values()),
    collections: Array.from(collectionMap.values()),
  };
}

export function parseCloudWorkspace(value: unknown): WorkspaceState | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<WorkspaceState>;
  if (!Array.isArray(candidate.bookmarks) || !Array.isArray(candidate.notes) || !Array.isArray(candidate.savedSearches) || !Array.isArray(candidate.collections)) return null;
  return {
    bookmarks: candidate.bookmarks,
    notes: candidate.notes,
    savedSearches: candidate.savedSearches,
    collections: candidate.collections,
  };
}

export async function loadAndMergeWorkspace(session: AuthSession, local: WorkspaceState) {
  const snapshot = await getWorkspaceSnapshot(session);
  const cloud = parseCloudWorkspace(snapshot?.state);
  const merged = cloud ? mergeWorkspace(local, cloud) : local;
  await saveWorkspaceSnapshot(session, merged);
  return merged;
}

export async function syncWorkspace(session: AuthSession, state: WorkspaceState) {
  await saveWorkspaceSnapshot(session, state);
}
