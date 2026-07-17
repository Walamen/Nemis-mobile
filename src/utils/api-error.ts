import type { ApiErrorBody } from '@/types/auth';

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

function isApiErrorBody(data: unknown): data is ApiErrorBody {
  return typeof data === 'object' && data !== null && 'message' in data;
}

export function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const { data } = error as { data: unknown };
    if (isApiErrorBody(data)) {
      return data.message;
    }
    if (typeof data === 'string' && data.length > 0) {
      return data;
    }
  }

  return FALLBACK_MESSAGE;
}
