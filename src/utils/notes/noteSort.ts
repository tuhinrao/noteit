import { Note } from "@/types/notes";

export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}