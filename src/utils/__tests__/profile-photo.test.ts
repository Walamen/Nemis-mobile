import { describe, expect, it } from '@jest/globals';

import { PROFILE_PHOTO_MAX_BYTES, validateProfilePhoto } from '@/utils/profile-photo';

describe('validateProfilePhoto (server: jpg/jpeg/png/webp, ≤ 5 MB)', () => {
  it('accepts a cropped JPEG from the picker', () => {
    expect(
      validateProfilePhoto({
        uri: 'file:///cache/photo.jpg',
        name: 'photo.jpg',
        size: 800_000,
        mimeType: 'image/jpeg',
      }),
    ).toEqual({
      ok: true,
      file: {
        uri: 'file:///cache/photo.jpg',
        name: 'photo.jpg',
        size: 800_000,
        mimeType: 'image/jpeg',
      },
    });
  });

  it('infers the type from the extension when the picker reports none', () => {
    const result = validateProfilePhoto({ uri: 'file:///x.WEBP', name: 'x.WEBP' });
    expect(result.ok && result.file.mimeType).toBe('image/webp');
  });

  it('rejects HEIC and other unsupported types', () => {
    expect(
      validateProfilePhoto({ uri: 'file:///x.heic', name: 'x.heic', mimeType: 'image/heic' }).ok,
    ).toBe(false);
  });

  it('enforces the 5 MB limit', () => {
    const base = { uri: 'file:///p.png', name: 'p.png', mimeType: 'image/png' };
    expect(validateProfilePhoto({ ...base, size: PROFILE_PHOTO_MAX_BYTES }).ok).toBe(true);
    expect(validateProfilePhoto({ ...base, size: PROFILE_PHOTO_MAX_BYTES + 1 }).ok).toBe(false);
  });
});
