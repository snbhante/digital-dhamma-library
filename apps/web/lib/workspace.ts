export const WORKSPACE_STORAGE_KEY = "digital-dhamma-library:workspace:v0.8.0";

export type Bookmark = {
  id: string;
  targetId: string;
  workId: string;
  paragraphId: string;
  workTitle: string;
  label: string;
  createdAt: string;
};

export type ResearchNote = {
  id: string;
  targetId: string;
  workId: string;
  paragraphId: string;
  workTitle: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type SavedSearch = {
  id: string;
  name: string;
  query: string;
  field: string;
  collection: string;
  type: string;
  language: string;
  limit: string;
  createdAt: string;
};

export type WorkspaceCollection = {
  id: string;
  name: string;
  description: string;
  bookmarkIds: string[];
  createdAt: string;
};

export type WorkspaceState = {
  bookmarks: Bookmark[];
  notes: ResearchNote[];
  savedSearches: SavedSearch[];
  collections: WorkspaceCollection[];
};

export const emptyWorkspace: WorkspaceState = {
  bookmarks: [],
  notes: [],
  savedSearches: [],
  collections: [],
};

export function readWorkspace(): WorkspaceState {
  if (typeof window === "undefined") return emptyWorkspace;
  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return emptyWorkspace;
    const value = JSON.parse(raw) as Partial<WorkspaceState>;
    return {
      bookmarks: Array.isArray(value.bookmarks) ? value.bookmarks : [],
      notes: Array.isArray(value.notes) ? value.notes : [],
      savedSearches: Array.isArray(value.savedSearches) ? value.savedSearches : [],
      collections: Array.isArray(value.collections) ? value.collections : [],
    };
  } catch {
    return emptyWorkspace;
  }
}

export function writeWorkspace(state: WorkspaceState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("ddl-workspace-updated"));
}

export function targetIdForParagraph(workId: string, paragraphId: string) {
  return `${workId}#${paragraphId}`;
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
