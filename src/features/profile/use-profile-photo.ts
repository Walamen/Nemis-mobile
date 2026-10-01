import { useState } from 'react';

import { useUploadProfileImageMutation } from '@/api/profile/profile-api';
import { pickProfilePhoto } from '@/services/image-picker';
import { getApiErrorMessage } from '@/utils/api-error';
import { validateProfilePhoto } from '@/utils/profile-photo';

/** Pick → validate → upload a new profile photo, with status for the UI. */
export function useProfilePhoto() {
  const [uploadProfileImage, { isLoading: isUploading }] = useUploadProfileImageMutation();
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isPhotoSaved, setIsPhotoSaved] = useState(false);

  async function changePhoto() {
    if (isUploading) return;
    setPhotoError(null);
    setIsPhotoSaved(false);
    try {
      const asset = await pickProfilePhoto();
      if (!asset) return;
      const result = validateProfilePhoto(asset);
      if (!result.ok) {
        setPhotoError(result.error);
        return;
      }
      await uploadProfileImage({
        uri: result.file.uri,
        name: result.file.name,
        type: result.file.mimeType,
      }).unwrap();
      setIsPhotoSaved(true);
    } catch (error) {
      setPhotoError(`Couldn't update your photo. ${getApiErrorMessage(error)}`);
    }
  }

  return { changePhoto, isUploading, photoError, isPhotoSaved };
}
