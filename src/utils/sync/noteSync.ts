import { db } from "@/lib/db";
import { Note, NoteSyncStatus } from "@/types/notes";
import { SyncNoteChange, SyncRequestBody, SyncResponseBody } from "@/types/sync";

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

function isValidIsoDate(value: string | null | undefined): boolean {
  if (!value) return false;
  return !Number.isNaN(Date.parse(value));
}

function normalizeChange(change: SyncNoteChange): SyncNoteChange {
  return {
    clientId: change.clientId,
    title: change.title.trim() || "Untitled note",
    body: change.body.trim(),
    isPinned: Boolean(change.isPinned),
    isArchived: Boolean(change.isArchived),
    createdAt: new Date(change.createdAt).toISOString(),
    updatedAt: new Date(change.updatedAt).toISOString(),
    deletedAt: change.deletedAt ? new Date(change.deletedAt).toISOString() : null,
  };
}

async function getNoteByClientIdIncludingDeleted(clientId: string): Promise<Note | null> {
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
    LIMIT 1
    `,
    [clientId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToNote(result.rows[0]);
}

async function insertSyncedNote(change: SyncNoteChange, syncTime: string): Promise<void> {
  await db.query(
    `
    INSERT INTO notes (
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
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `,
    [
      change.clientId,
      change.title,
      change.body,
      change.isPinned,
      change.isArchived,
      "synced",
      change.createdAt,
      change.updatedAt,
      syncTime,
      change.deletedAt,
    ]
  );
}

async function updateSyncedNote(change: SyncNoteChange, syncTime: string): Promise<void> {
  await db.query(
    `
    UPDATE notes
    SET
      title = $2,
      body = $3,
      is_pinned = $4,
      is_archived = $5,
      sync_status = 'synced',
      updated_at = $6,
      last_synced_at = $7,
      deleted_at = $8
    WHERE client_id = $1
    `,
    [
      change.clientId,
      change.title,
      change.body,
      change.isPinned,
      change.isArchived,
      change.updatedAt,
      syncTime,
      change.deletedAt,
    ]
  );
}

async function getServerChangesSince(lastSyncedAt: string | null): Promise<Note[]> {
  if (!lastSyncedAt) {
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
      ORDER BY updated_at DESC
      `
    );

    return result.rows.map(mapRowToNote);
  }

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
    WHERE updated_at > $1
       OR deleted_at > $1
    ORDER BY updated_at DESC
    `,
    [lastSyncedAt]
  );

  return result.rows.map(mapRowToNote);
}

export function validateSyncRequestBody(body: unknown): body is SyncRequestBody {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const candidate = body as SyncRequestBody;

  if (
    candidate.lastSyncedAt !== undefined &&
    candidate.lastSyncedAt !== null &&
    !isValidIsoDate(candidate.lastSyncedAt)
  ) {
    return false;
  }

  if (!Array.isArray(candidate.changes)) {
    return false;
  }

  return candidate.changes.every((change) => {
    return (
      typeof change.clientId === "string" &&
      typeof change.title === "string" &&
      typeof change.body === "string" &&
      typeof change.isPinned === "boolean" &&
      typeof change.isArchived === "boolean" &&
      isValidIsoDate(change.createdAt) &&
      isValidIsoDate(change.updatedAt) &&
      (change.deletedAt === null || isValidIsoDate(change.deletedAt))
    );
  });
}

export async function runNoteSync(body: SyncRequestBody): Promise<SyncResponseBody> {
  const syncTime = new Date().toISOString();
  const applied: string[] = [];
  const skipped: string[] = [];

  await db.query("BEGIN");

  try {
    for (const rawChange of body.changes) {
      const change = normalizeChange(rawChange);
      const existing = await getNoteByClientIdIncludingDeleted(change.clientId);

      if (!existing) {
        if (change.deletedAt) {
          skipped.push(change.clientId);
          continue;
        }

        await insertSyncedNote(change, syncTime);
        applied.push(change.clientId);
        continue;
      }

      if (existing.deletedAt && !change.deletedAt) {
        skipped.push(change.clientId);
        continue;
      }

      const serverUpdatedAt = new Date(existing.updatedAt).getTime();
      const clientUpdatedAt = new Date(change.updatedAt).getTime();

      if (clientUpdatedAt >= serverUpdatedAt) {
        await updateSyncedNote(change, syncTime);
        applied.push(change.clientId);
      } else {
        skipped.push(change.clientId);
      }
    }

    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }

  const changes = await getServerChangesSince(body.lastSyncedAt ?? null);

  return {
    serverTime: syncTime,
    changes,
    summary: {
      applied,
      skipped, 
    },
  };
}