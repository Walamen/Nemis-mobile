export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  imageUrl: string | null;
  profileImageUrl: string;
};

export type UpdateProfileRequest = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  imageUrl?: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type UpdateProfileResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isActive: boolean;
  emailVerified: boolean;
};
