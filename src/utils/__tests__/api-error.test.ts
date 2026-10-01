import { describe, expect, it } from '@jest/globals';

import { API_ERROR_MESSAGES, getApiErrorKind, getApiErrorMessage } from '@/utils/api-error';

describe('getApiErrorKind', () => {
  it('classifies transport failures as offline', () => {
    expect(getApiErrorKind({ status: 'FETCH_ERROR', error: 'Network request failed' })).toBe(
      'offline',
    );
    expect(getApiErrorKind({ status: 'TIMEOUT_ERROR', error: 'timeout' })).toBe('offline');
  });

  it('classifies 401 as session and 5xx as server', () => {
    expect(getApiErrorKind({ status: 401, data: {} })).toBe('session');
    expect(getApiErrorKind({ status: 503, data: {} })).toBe('server');
  });

  it('falls back to unknown', () => {
    expect(getApiErrorKind({ status: 400, data: {} })).toBe('unknown');
    expect(getApiErrorKind(undefined)).toBe('unknown');
  });
});

describe('getApiErrorMessage', () => {
  it("shows the server's message for a login 401 (wrong credentials, not an expired session)", () => {
    expect(getApiErrorMessage({ status: 401, data: { message: 'Invalid credentials' } })).toBe(
      'Invalid credentials',
    );
  });

  it('never shows raw 5xx bodies', () => {
    expect(
      getApiErrorMessage({ status: 500, data: { message: 'PrismaClientKnownRequestError: …' } }),
    ).toBe(API_ERROR_MESSAGES.server);
  });

  it('uses offline copy when the request never got a response', () => {
    expect(getApiErrorMessage({ status: 'FETCH_ERROR', error: 'x' })).toBe(
      API_ERROR_MESSAGES.offline,
    );
  });
});
