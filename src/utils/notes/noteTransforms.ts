import { NOTES_CONFIG } from "@/config/notes";
import { CreateNoteInput, Note, UpdateNoteInput } from "@/types/notes";

function normalizeTitle(title: string): string {
  const trimmed = title.trim();
  return trimmed || NOTES_CONFIG.emptyTitleFallback;
}

function normalizeBody(body: string): string {
  return body.trim();
}

export function createNoteFromInput(
  input: CreateNoteInput
): Omit<
  Note,
  "id" | "clientId" | "syncStatus" | "lastSyncedAt" | "deletedAt"
> {
  const now = new Date().toISOString();

  return {
    title: normalizeTitle(input.title),
    body: normalizeBody(input.body),
    isPinned: Boolean(input.isPinned),
    isArchived: Boolean(input.isArchived),
    createdAt: now,
    updatedAt: now,
  };
}

export function mergeNoteUpdate(existingNote: Note, input: UpdateNoteInput): Note {
  return {
    ...existingNote,
    title: input.title !== undefined ? normalizeTitle(input.title) : existingNote.title,
    body: input.body !== undefined ? normalizeBody(input.body) : existingNote.body,
    isPinned: input.isPinned ?? existingNote.isPinned,
    isArchived: input.isArchived ?? existingNote.isArchived,
    syncStatus:
      existingNote.syncStatus === "pending_create"
        ? "pending_create"
        : "pending_update",
    updatedAt: new Date().toISOString(),
  };
}