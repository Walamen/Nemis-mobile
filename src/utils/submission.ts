import type { SubmitAssignmentRequest } from '@/types/tasks';

/** Server limit (`CloudinaryService.MAX_FILE_SIZE_UPLOAD`). */
export const SUBMISSION_MAX_BYTES = 20 * 1024 * 1024;

/**
 * Exactly the server's `ALLOWED_FILE_MIMES` for assignment uploads, keyed by
 * extension. The legacy PowerPoint `.ppt` (and `.xls`) are *not* accepted by
 * the server — only the modern Office formats.
 */
const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

export const SUBMISSION_ACCEPTED_MIME_TYPES = [...new Set(Object.values(MIME_BY_EXTENSION))];
export const SUBMISSION_ACCEPTED_LABEL =
  'PDF, Word (DOC, DOCX), Excel (XLSX), PowerPoint (PPTX), JPG or PNG';

/** A picked file, ready to upload. Holds a URI, never the file contents. */
export type SubmissionFile = {
  uri: string;
  name: string;
  size?: number;
  mimeType: string;
};

/** What the document picker returns for one asset. */
export type PickedAsset = { uri: string; name: string; size?: number; mimeType?: string };

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase();
}

/**
 * The MIME type to upload with. The server validates the multipart part's
 * declared type, so it must be one it accepts: the picker's own type when
 * that's accepted, otherwise the type implied by the file extension
 * (pickers often report `application/octet-stream` or nothing).
 */
export function resolveSubmissionMimeType(name: string, reported?: string): string | undefined {
  if (reported && SUBMISSION_ACCEPTED_MIME_TYPES.includes(reported)) return reported;
  return MIME_BY_EXTENSION[extensionOf(name)];
}

export type FileValidationResult =
  { ok: true; file: SubmissionFile } | { ok: false; error: string };

export function validateSubmissionFile(asset: PickedAsset): FileValidationResult {
  const mimeType = resolveSubmissionMimeType(asset.name, asset.mimeType);
  if (!mimeType) {
    return {
      ok: false,
      error: `"${asset.name}" can't be submitted. Accepted files: ${SUBMISSION_ACCEPTED_LABEL}.`,
    };
  }
  if (asset.size != null && asset.size > SUBMISSION_MAX_BYTES) {
    return {
      ok: false,
      error: `"${asset.name}" is ${formatFileSize(asset.size)}. The maximum is 20 MB.`,
    };
  }
  return {
    ok: true,
    file: { uri: asset.uri, name: asset.name, size: asset.size, mimeType },
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type FormPart = [name: 'response', value: string] | [name: 'file', value: SubmissionPartFile];
/** React Native's multipart file descriptor. */
export type SubmissionPartFile = { uri: string; name: string; type: string };

/**
 * Multipart parts for `POST /student/assignments/:id/submit` — `response`
 * (text) and/or `file` (the server's `FileInterceptor('file')`, one file).
 * Kept pure so the request shape is unit-testable without `FormData`.
 */
export function getSubmissionFormParts({
  response,
  file,
}: Omit<SubmitAssignmentRequest, 'assignmentId'>): FormPart[] {
  const parts: FormPart[] = [];
  if (response) parts.push(['response', response]);
  if (file) parts.push(['file', { uri: file.uri, name: file.name, type: file.type }]);
  return parts;
}

/**
 * The server's global `ValidationPipe` (`whitelist` + `forbidNonWhitelisted`)
 * rejects the `response` field because `SubmitAssignmentDto` has no
 * class-validator decorators — every text answer fails with
 * "property response should not exist". Recognised so the student gets an
 * actionable message instead of the raw one.
 */
export function isResponseFieldRejected(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('data' in error)) return false;
  const { data } = error as { data: unknown };
  if (!data || typeof data !== 'object' || !('message' in data)) return false;
  const { message } = data as { message: unknown };
  const messages = Array.isArray(message) ? message : [message];
  return messages.some(
    (m) => typeof m === 'string' && m.includes('property response should not exist'),
  );
}

export const RESPONSE_FIELD_REJECTED_MESSAGE =
  "The school server isn't accepting written answers right now. Attach your work as a file and clear the text box, then submit again — or contact your teacher.";
