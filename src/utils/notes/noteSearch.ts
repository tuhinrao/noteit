import { Note } from "@/types/notes";

export function filterNotesBySearch(notes: Note[], query: string): Note[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return notes;
  }

  return notes.filter((note) => {
    return (
      note.title.toLowerCase().includes(normalizedQuery) ||
      note.body.toLowerCase().includes(normalizedQuery)
    );
  });
}