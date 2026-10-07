export type SystemRole =
  | 'SUPER_ADMIN'
  | 'MINISTRY_ADMIN'
  | 'COUNTY_ADMIN'
  | 'DEO'
  | 'INSTITUTION_ADMIN'
  | 'TEACHER'
  | 'STUDENT'
  | 'DATA_OFFICER'
  | 'VIEWER'
  | 'PARENT';

export type Institution = {
  id: string;
  name: string;
  code: string;
  type: string;
  address?: string;
  metadata?: unknown;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImageUrl?: string | null;
  role: SystemRole;
  countyId?: string;
  districtId?: string;
  institutionId?: string;
  institution?: Institution;
};

/** The API (x-app-context: sis) accepts a NEMIS ID for students or an email
 * for parents — exactly one identifier per request. */
export type LoginRequest =
  | { nemisId: string; password: string }
  | { email: string; password: string };

export type RequestPasswordResetRequest = {
  email: string;
};

export type ConfirmPasswordResetRequest = {
  token: string;
  password: string;
  passwordConfirm: string;
};

export type ApiEnvelope<T> = {
  success: true;
  data: T;
};

export type ApiErrorBody = {
  success: false;
  errorCode: string;
  message: string;
  errors?: unknown[];
  timestamp: string;
  path: string;
};
