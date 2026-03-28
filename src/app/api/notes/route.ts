import { NextResponse } from "next/server";
import { getAllNotes, createNote } from "@/utils/notes/noteStore";
import { validateCreateNoteInput } from "@/utils/notes/noteValidation";
import { filterNotesBySearch } from "@/utils/notes/noteSearch";
import { sortNotes } from "@/utils/notes/noteSort";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? "";
  const includeArchived = searchParams.get("includeArchived") === "true";

  const allNotes = await getAllNotes();
  const visibleNotes = includeArchived
    ? allNotes
    : allNotes.filter((note) => !note.isArchived);

  const filteredNotes = filterNotesBySearch(visibleNotes, query);
  const sortedNotes = sortNotes(filteredNotes);

  return NextResponse.json({ notes: sortedNotes });
}

export async function POST(request: Request) {
  const body = await request.json();

  const validation = validateCreateNoteInput(body);

  if (!validation.isValid) {
    return NextResponse.json(
      { error: "Invalid note input.", details: validation.errors },
      { status: 400 }
    );
  }

  const note = await createNote(body);

  return NextResponse.json({ note }, { status: 201 });
}