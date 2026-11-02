import type { ApiErrorBody } from '@/types/auth';

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

export type ApiErrorKind = 'offline' | 'session' | 'server' | 'notEnrolled' | 'unknown';

/** Student-facing copy per error kind — never raw server/transport detail. */
export const API_ERROR_MESSAGES: Record<ApiErrorKind, string> = {
  offline: "Can't reach NEMIS. Check your internet connection and try again.",
  session: 'Your session has expired. Please sign in again.',
  server: "We couldn't load this information right now. Please try again.",
  notEnrolled:
    "You're not in a class right now. Your school will place you in a class for the new school year, and this will show here.",
  unknown: FALLBACK_MESSAGE,
};

function isApiErrorBody(data: unknown): data is ApiErrorBody {
  return typeof data === 'object' && data !== null && 'message' in data;
}

/**
 * The server answers "No active enrollment found" (403 or 404) from the
 * student timetable, assignments and subject-detail routes when the student
 * isn't in a class — normal between school years, after the school closes
 * one and before it enrols the student for the next. Not a failure.
 */
function isNotEnrolledResponse(status: unknown, data: unknown): boolean {
  if (status !== 403 && status !== 404) return false;
  if (!isApiErrorBody(data)) return false;
  const messages = Array.isArray(data.message) ? data.message : [data.message];
  return messages.some(
    (message) => typeof message === 'string' && /no active enrol?lment/i.test(message),
  );
}

/**
 * Classifies an RTK Query error. `FETCH_ERROR`/`TIMEOUT_ERROR` mean the
 * request never got a response (no connection, DNS failure, server down) —
 * distinct from the server answering with an error status.
 */
export function getApiErrorKind(error: unknown): ApiErrorKind {
  if (!error || typeof error !== 'object' || !('status' in error)) return 'unknown';
  const { status } = error as { status: unknown };
  if (status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR') return 'offline';
  if (status === 401) return 'session';
  if (isNotEnrolledResponse(status, (error as { data?: unknown }).data)) return 'notEnrolled';
  if (typeof status === 'number' && status >= 500) return 'server';
  return 'unknown';
}

/**
 * Message for a failed user action (login, submit, send, …). Connectivity
 * and 5xx failures get fixed copy (5xx bodies can carry internal detail); a
 * 4xx message from the server — e.g. "Invalid credentials" on a login 401,
 * or "This assignment does not belong to your class" — is shown as-is.
 */
export function getApiErrorMessage(error: unknown): string {
  const kind = getApiErrorKind(error);
  if (kind === 'offline' || kind === 'server' || kind === 'notEnrolled') {
    return API_ERROR_MESSAGES[kind];
  }

  if (error && typeof error === 'object' && 'data' in error) {
    const { data } = error as { data: unknown };
    if (isApiErrorBody(data) && typeof data.message === 'string') {
      return data.message;
    }
  }

  return FALLBACK_MESSAGE;
}
