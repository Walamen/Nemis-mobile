import * as ImagePicker from 'expo-image-picker';

import type { PickedAsset } from '@/utils/submission';

/**
 * Opens the photo library for a square profile picture. Cropping keeps the
 * upload small and makes iOS return a JPEG (not HEIC), which the server
 * accepts. Resolves `null` if the student cancels.
 */
export async function pickProfilePhoto(): Promise<PickedAsset | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) return null;
  return {
    uri: asset.uri,
    name: asset.fileName ?? asset.uri.split('/').pop() ?? 'profile.jpg',
    size: asset.fileSize,
    mimeType: asset.mimeType,
  };
}
