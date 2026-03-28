"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ArchiveIcon from "@mui/icons-material/Archive";
import NotesIcon from "@mui/icons-material/Notes";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmptyNotesState from "@/components/notes/EmptyNotesState";
import NoteList from "@/components/notes/NoteList";
import SearchBar from "@/components/notes/SearchBar";
import { NOTES_CONFIG } from "@/config/notes";
import { Note } from "@/types/notes";

type NotesViewMode = "active" | "archived";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<NotesViewMode>("active");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const includeArchived = viewMode === "archived";

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const params = new URLSearchParams({
        query: searchQuery,
        includeArchived: String(includeArchived),
      });

      const response = await fetch(`/api/notes?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load notes.");
      }

      const data = await response.json();

      const visibleNotes =
        viewMode === "archived"
          ? data.notes.filter((note: Note) => note.isArchived)
          : data.notes.filter((note: Note) => !note.isArchived);

      setNotes(visibleNotes);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load notes.");
    } finally {
      setIsLoading(false);
    }
  }, [includeArchived, searchQuery, viewMode]);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  async function confirmDelete() {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/notes/${deleteTargetId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note.");
      }

      setDeleteTargetId(null);
      await fetchNotes();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to delete note.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleTogglePin(note: Note) {
    await fetch(`/api/notes/${note.clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: !note.isPinned }),
    });

    await fetchNotes();
  }

  async function handleToggleArchive(note: Note) {
    await fetch(`/api/notes/${note.clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: !note.isArchived }),
    });

    await fetchNotes();
  }

  const emptyState = useMemo(() => {
    if (searchQuery.trim()) {
      return { title: "No matching notes", description: "Try a different search term." };
    }

    if (viewMode === "archived") {
      return { title: "No archived notes", description: "Archived notes will appear here." };
    }

    return { title: "No notes yet", description: "Create your first note." };
  }, [searchQuery, viewMode]);

  return (
    <AppShell>
      <Stack spacing={3}>
        <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography variant="h4">Notes</Typography>
                <Typography variant="body2" color="text.secondary">
                  Simple text-only notes pilot
                </Typography>
              </Box>

              <Button component={Link} href="/notes/new" variant="contained" startIcon={<AddIcon />}>
                New Note
              </Button>
            </Stack>

            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={NOTES_CONFIG.searchPlaceholder}
            />

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && setViewMode(value)}
              size="small"
            >
              <ToggleButton value="active">
                <NotesIcon sx={{ mr: 1 }} />
                Active
              </ToggleButton>
              <ToggleButton value="archived">
                <ArchiveIcon sx={{ mr: 1 }} />
                Archived
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Paper>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : notes.length === 0 ? (
          <EmptyNotesState {...emptyState} />
        ) : (
          <NoteList
            notes={notes}
            onDelete={(clientId) => setDeleteTargetId(clientId)}
            onTogglePin={handleTogglePin}
            onToggleArchive={handleToggleArchive}
          />
        )}
      </Stack>

      <ConfirmDialog
        open={!!deleteTargetId}
        title="Delete note?"
        description="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
        isLoading={isDeleting}
      />
    </AppShell>
  );
}