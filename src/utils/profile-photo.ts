import type { PickedAsset, SubmissionFile } from '@/utils/submission';

/** Server limit on `PATCH /users/me/profile-image` (`MaxFileSizeValidator`). */
export const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

/** The server's `FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ })`. */
const PHOTO_MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};
const ACCEPTED_PHOTO_MIMES = new Set(Object.values(PHOTO_MIME_BY_EXTENSION));

export type PhotoValidationResult =
  { ok: true; file: SubmissionFile } | { ok: false; error: string };

export function validateProfilePhoto(asset: PickedAsset): PhotoValidationResult {
  const extension = asset.name.split('.').pop()?.toLowerCase() ?? '';
  const mimeType =
    asset.mimeType && ACCEPTED_PHOTO_MIMES.has(asset.mimeType)
      ? asset.mimeType
      : PHOTO_MIME_BY_EXTENSION[extension];
  if (!mimeType) {
    return { ok: false, error: 'Choose a JPG, PNG or WebP photo.' };
  }
  if (asset.size != null && asset.size > PROFILE_PHOTO_MAX_BYTES) {
    return { ok: false, error: 'That photo is larger than 5 MB. Choose a smaller one.' };
  }
  return {
    ok: true,
    file: { uri: asset.uri, name: asset.name, size: asset.size, mimeType },
  };
}
