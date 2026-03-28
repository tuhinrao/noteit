"use client";

import { useRouter } from "next/navigation";
import { Button, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AppShell from "@/components/layout/AppShell";
import NoteForm from "@/components/notes/NoteForm";

export default function NewNotePage() {
  const router = useRouter();

  async function handleCreateNote(values: {
    title?: string;
    body?: string;
    isPinned?: boolean;
    isArchived?: boolean;
  }) {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: values.title ?? "",
        body: values.body ?? "",
        isPinned: values.isPinned ?? false,
        isArchived: values.isArchived ?? false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error ?? "Failed to create note.");
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

          <Typography variant="h4">Create Note</Typography>
        </Stack>

        <NoteForm submitLabel="Create Note" onSubmit={handleCreateNote} />
      </Stack>
    </AppShell>
  );
}