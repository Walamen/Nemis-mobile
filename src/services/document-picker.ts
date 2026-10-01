import * as DocumentPicker from 'expo-document-picker';

import { SUBMISSION_ACCEPTED_MIME_TYPES, type PickedAsset } from '@/utils/submission';

/**
 * Opens the system file picker for one assignment-submission file, filtered
 * to the types the server accepts. Copied to the app cache so the upload can
 * read it. Resolves `null` if the student cancels.
 */
export async function pickSubmissionDocument(): Promise<PickedAsset | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: SUBMISSION_ACCEPTED_MIME_TYPES,
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) return null;
  return { uri: asset.uri, name: asset.name, size: asset.size, mimeType: asset.mimeType };
}
