"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import AppShell from "@/components/layout/AppShell";
import NoteForm from "@/components/notes/NoteForm";
import { Note } from "@/types/notes";

export default function EditNotePage() {
  const params = useParams<{ clientId: string }>();
  const router = useRouter();

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchNote() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch(`/api/notes/${params.clientId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load note.");
        }

        const data = await response.json();
        setNote(data.note);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to load note.");
      } finally {
        setIsLoading(false);
      }
    }

    void fetchNote();
  }, [params.clientId]);

  async function handleUpdateNote(values: {
    title?: string;
    body?: string;
    isPinned?: boolean;
    isArchived?: boolean;
  }) {
    const response = await fetch(`/api/notes/${params.clientId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error ?? "Failed to update note.");
    }

    router.push("/notes");
    router.refresh();
  }

  return (
    <AppShell>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/notes")}
            sx={{ alignSelf: "flex-start" }}
          >
            Back to Notes
          </Button>

          <Typography variant="h4">Edit Note</Typography>
        </Stack>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : errorMessage ? (
          <Alert severity="error">{errorMessage}</Alert>
        ) : note ? (
          <NoteForm
            initialValues={note}
            submitLabel="Save Changes"
            onSubmit={handleUpdateNote}
          />
        ) : (
          <Alert severity="warning">Note not found.</Alert>
        )}
      </Stack>
    </AppShell>
  );
}