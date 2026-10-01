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

/** `GET /student/profile/me` (`StudentPortalService.getMyProfile`) — the
 * student's NEMIS record. Note it does *not* include the admission/enrollment
 * date, the institution's county, or a class position. */
export type StudentProfile = {
  id: string;
  nemisId: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  /** ISO timestamp of a date-only value (midnight UTC). */
  dateOfBirth: string;
  gender: string;
  institution: { id: string; name: string } | null;
  enrollments: {
    id: string;
    class: { id: string; name: string; gradeLevel: string | number | null } | null;
    academicYear: { id: string; name: string; isCurrent: boolean } | null;
    term: { id: string; name: string; isCurrent: boolean } | null;
    status: string;
  }[];
  guardians: {
    guardian: {
      id: string;
      firstName: string;
      lastName: string;
      relationship: string;
      phoneNumber: string | null;
    };
    isPrimary: boolean;
  }[];
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
