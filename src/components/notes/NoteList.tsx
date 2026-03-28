"use client";

import { Stack } from "@mui/material";
import { Note } from "@/types/notes";
import NoteListItem from "./NoteListItem";

interface NoteListProps {
  notes: Note[];
  onDelete: (id: string) => void;
  onTogglePin: (note: Note) => void;
  onToggleArchive: (note: Note) => void;
}

export default function NoteList({
  notes,
  onDelete,
  onTogglePin,
  onToggleArchive,
}: NoteListProps) {
  return (
    <Stack spacing={2}>
      {notes.map((note) => (
        <NoteListItem
          key={note.clientId}
          note={note}
          onDelete={onDelete}
          onTogglePin={onTogglePin}
          onToggleArchive={onToggleArchive}
        />
      ))}
    </Stack>
  );
}