import { NextResponse } from "next/server";
import { runNoteSync, validateSyncRequestBody } from "@/utils/sync/noteSync";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!validateSyncRequestBody(body)) {
      return NextResponse.json(
        { error: "Invalid sync payload." },
        { status: 400 }
      );
    }

    const result = await runNoteSync(body);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Sync failed.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}