import { NOTES_CONFIG } from "@/config/notes";
import { CreateNoteInput, UpdateNoteInput } from "@/types/notes";

export interface NoteValidationResult {
  isValid: boolean;
  errors: string[];
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function validateCreateNoteInput(input: CreateNoteInput): NoteValidationResult {
  const errors: string[] = [];

  if (!isString(input.title)) {
    errors.push("Title must be a string.");
  }

  if (!isString(input.body)) {
    errors.push("Body must be a string.");
  }

  if (isString(input.title) && input.title.length > NOTES_CONFIG.titleMaxLength) {
    errors.push(`Title must be ${NOTES_CONFIG.titleMaxLength} characters or fewer.`);
  }

  if (isString(input.body) && input.body.length > NOTES_CONFIG.bodyMaxLength) {
    errors.push(`Body must be ${NOTES_CONFIG.bodyMaxLength} characters or fewer.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateUpdateNoteInput(input: UpdateNoteInput): NoteValidationResult {
  const errors: string[] = [];

  if (input.title !== undefined && !isString(input.title)) {
    errors.push("Title must be a string.");
  }

  if (input.body !== undefined && !isString(input.body)) {
    errors.push("Body must be a string.");
  }

  if (isString(input.title) && input.title.length > NOTES_CONFIG.titleMaxLength) {
    errors.push(`Title must be ${NOTES_CONFIG.titleMaxLength} characters or fewer.`);
  }

  if (isString(input.body) && input.body.length > NOTES_CONFIG.bodyMaxLength) {
    errors.push(`Body must be ${NOTES_CONFIG.bodyMaxLength} characters or fewer.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}