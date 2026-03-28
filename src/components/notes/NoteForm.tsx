"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import { CreateNoteInput, Note, UpdateNoteInput } from "@/types/notes";

interface NoteFormProps {
  initialValues?: Partial<Note>;
  submitLabel: string;
  onSubmit: (values: CreateNoteInput | UpdateNoteInput) => Promise<void>;
}

export default function NoteForm({
  initialValues,
  submitLabel,
  onSubmit,
}: NoteFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [body, setBody] = useState(initialValues?.body ?? "");
  const [isPinned, setIsPinned] = useState(initialValues?.isPinned ?? false);
  const [isArchived, setIsArchived] = useState(initialValues?.isArchived ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await onSubmit({
        title,
        body,
        isPinned,
        isArchived,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack spacing={2.5}>
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

        <TextField
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          fullWidth
        />

        <TextField
          label="Body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          multiline
          minRows={6}
          fullWidth
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={isPinned}
                onChange={(event) => setIsPinned(event.target.checked)}
              />
            }
            label="Pinned"
          />

          <FormControlLabel
            control={
              <Switch
                checked={isArchived}
                onChange={(event) => setIsArchived(event.target.checked)}
              />
            }
            label="Archived"
          />
        </Box>

        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </Stack>
    </Paper>
  );
}