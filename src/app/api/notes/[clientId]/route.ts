import { NextResponse } from "next/server";
import {
  deleteNoteByClientId,
  getNoteByClientId,
  updateNoteByClientId,
} from "@/utils/notes/noteStore";
import { validateUpdateNoteInput } from "@/utils/notes/noteValidation";

interface RouteContext {
  params: Promise<{
    clientId: string;
  }>;
}

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function GET(_: Request, context: RouteContext) {
  const { clientId: clientId } = await context.params;

  if (!isValidUuid(clientId)) {
    return NextResponse.json({ error: "Invalid note clientId." }, { status: 400 });
  }

  const note = await getNoteByClientId(clientId);

  if (!note) {
    return NextResponse.json({ error: "Note not found." }, { status: 404 });
  }

  return NextResponse.json({ note });
}

export async function PUT(request: Request, context: RouteContext) {
  const { clientId: clientId } = await context.params;

  if (!isValidUuid(clientId)) {
    return NextResponse.json({ error: "Invalid note clientId." }, { status: 400 });
  }

  const body = await request.json();
  const validation = validateUpdateNoteInput(body);

  if (!validation.isValid) {
    return NextResponse.json(
      { error: "Invalid note update.", details: validation.errors },
      { status: 400 }
    );
  }

  const updatedNote = await updateNoteByClientId(clientId, body);

  if (!updatedNote) {
    return NextResponse.json({ error: "Note not found." }, { status: 404 });
  }

  return NextResponse.json({ note: updatedNote });
}

export async function DELETE(_: Request, context: RouteContext) {
  const { clientId: clientId } = await context.params;

  if (!isValidUuid(clientId)) {
    return NextResponse.json({ error: "Invalid note clientId." }, { status: 400 });
  }

  const deleted = await deleteNoteByClientId(clientId);

  if (!deleted) {
    return NextResponse.json({ error: "Note not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}