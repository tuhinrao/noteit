import { db } from "@/lib/db";
import { CreateNoteInput, Note, NoteSyncStatus, UpdateNoteInput } from "@/types/notes";
import { createNoteFromInput, mergeNoteUpdate } from "./noteTransforms";

interface NoteRow {
  id: number;
  client_id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  is_archived: boolean;
  sync_status: NoteSyncStatus;
  created_at: Date | string;
  updated_at: Date | string;
  last_synced_at: Date | string | null;
  deleted_at: Date | string | null;
}

function mapRowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    clientId: row.client_id,
    title: row.title,
    body: row.body,
    isPinned: row.is_pinned,
    isArchived: row.is_archived,
    syncStatus: row.sync_status,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    lastSyncedAt: row.last_synced_at ? new Date(row.last_synced_at).toISOString() : null,
    deletedAt: row.deleted_at ? new Date(row.deleted_at).toISOString() : null,
  };
}

export async function getAllNotes(): Promise<Note[]> {
  const result = await db.query<NoteRow>(`
    SELECT
      id,
      client_id,
      title,
      body,
      is_pinned,
      is_archived,
      sync_status,
      created_at,
      updated_at,
      last_synced_at,
      deleted_at
    FROM notes
    WHERE deleted_at IS NULL
  `);

  return result.rows.map(mapRowToNote);
}

export async function getNoteByClientId(clientId: string): Promise<Note | null> {
  const result = await db.query<NoteRow>(
    `
    SELECT
      id,
      client_id,
      title,
      body,
      is_pinned,
      is_archived,
      sync_status,
      created_at,
      updated_at,
      last_synced_at,
      deleted_at
    FROM notes
    WHERE client_id = $1
      AND deleted_at IS NULL
    LIMIT 1
    `,
    [clientId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToNote(result.rows[0]);
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const newNote = createNoteFromInput(input);

  const result = await db.query<NoteRow>(
    `
    INSERT INTO notes (
      title,
      body,
      is_pinned,
      is_archived,
      sync_status,
      created_at,
      updated_at,
      last_synced_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING
      id,
      client_id,
      title,
      body,
      is_pinned,
      is_archived,
      sync_status,
      created_at,
      updated_at,
      last_synced_at,
      deleted_at
    `,
    [
      newNote.title,
      newNote.body,
      newNote.isPinned,
      newNote.isArchived,
      "synced",
      newNote.createdAt,
      newNote.updatedAt,
      new Date().toISOString(),
    ]
  );

  return mapRowToNote(result.rows[0]);
}

export async function updateNoteByClientId(
  clientId: string,
  input: UpdateNoteInput
): Promise<Note | null> {
  const existingNote = await getNoteByClientId(clientId);

  if (!existingNote) {
    return null;
  }

  const updatedNote = mergeNoteUpdate(existingNote, input);

  const result = await db.query<NoteRow>(
    `
    UPDATE notes
    SET
      title = $2,
      body = $3,
      is_pinned = $4,
      is_archived = $5,
      sync_status = $6,
      updated_at = $7,
      last_synced_at = $8
    WHERE client_id = $1
      AND deleted_at IS NULL
    RETURNING
      id,
      client_id,
      title,
      body,
      is_pinned,
      is_archived,
      sync_status,
      created_at,
      updated_at,
      last_synced_at,
      deleted_at
    `,
    [
      clientId,
      updatedNote.title,
      updatedNote.body,
      updatedNote.isPinned,
      updatedNote.isArchived,
      "synced",
      updatedNote.updatedAt,
      new Date().toISOString(),
    ]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToNote(result.rows[0]);
}

export async function deleteNoteByClientId(clientId: string): Promise<boolean> {
  const result = await db.query(
    `
    DELETE FROM notes
    WHERE client_id = $1
      AND deleted_at IS NULL
    `,
    [clientId]
  );

  return (result.rowCount ?? 0) > 0;
}