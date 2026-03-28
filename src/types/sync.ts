import { Note } from "@/types/notes";

export interface SyncNoteChange {
  clientId: string;
  title: string;
  body: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SyncRequestBody {
  lastSyncedAt?: string | null;
  changes: SyncNoteChange[];
}

export interface SyncResultSummary {
  applied: string[];
  skipped: string[];
}

export interface SyncResponseBody {
  serverTime: string;
  changes: Note[];
  summary: SyncResultSummary;
}