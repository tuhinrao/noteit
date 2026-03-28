export type NoteSyncStatus =
  | "synced"
  | "pending_create"
  | "pending_update"
  | "pending_delete"
  | "sync_error";

export interface Note {
  id: number;
  clientId: string;
  title: string;
  body: string;
  isPinned: boolean;
  isArchived: boolean;
  syncStatus: NoteSyncStatus;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string | null;
  deletedAt: string | null;
}

export interface CreateNoteInput {
  title: string;
  body: string;
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface UpdateNoteInput {
  title?: string;
  body?: string;
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface NotesListResponse {
  notes: Note[];
}

export interface NoteResponse {
  note: Note;
}

export interface NoteErrorResponse {
  error: string;
  details?: string[];
}