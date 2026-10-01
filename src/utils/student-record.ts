import type { StudentProfile } from '@/types/profile';

export type RecordRow = { label: string; value: string };

/** The active enrollment's class name (e.g. "Grade 5B"), if any. */
export function getCurrentClassName(profile: StudentProfile | undefined): string | undefined {
  return profile?.enrollments.find((enrollment) => enrollment.status === 'ACTIVE')?.class?.name;
}

/** Primary guardian's name, else the first linked guardian's. */
export function getGuardianName(profile: StudentProfile | undefined): string | undefined {
  const link = profile?.guardians.find((entry) => entry.isPrimary) ?? profile?.guardians[0];
  return link ? `${link.guardian.firstName} ${link.guardian.lastName}` : undefined;
}

/** "0770 214 885 · Musu Konneh" — primary guardian's phone and name. */
export function getGuardianContact(profile: StudentProfile | undefined): string | undefined {
  const link = profile?.guardians.find((entry) => entry.isPrimary) ?? profile?.guardians[0];
  if (!link) return undefined;
  const name = `${link.guardian.firstName} ${link.guardian.lastName}`;
  return link.guardian.phoneNumber ? `${link.guardian.phoneNumber} · ${name}` : name;
}

/**
 * "14 March 2015". Formatted in UTC because the server sends a date-only
 * value as midnight UTC — local-time formatting would show the previous day
 * west of UTC.
 */
export function formatDateOfBirth(iso: string): string | undefined {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * The "Student record" rows the server can actually fill, in design order.
 * Rows with no value are dropped rather than shown as placeholders. The
 * design's County, Enrolled since and (under term stats) Position rows are
 * not returned by any endpoint, so they're never produced here.
 */
export function buildStudentRecord(
  profile: StudentProfile | undefined,
  fallback: { className?: string; schoolName?: string },
): RecordRow[] {
  const rows: (RecordRow | null)[] = [
    profile?.nemisId ? { label: 'NEMIS ID', value: profile.nemisId } : null,
    profile?.dateOfBirth ? row('Date of birth', formatDateOfBirth(profile.dateOfBirth)) : null,
    row('Grade / class', getCurrentClassName(profile) ?? fallback.className),
    row('School', profile?.institution?.name ?? fallback.schoolName),
    row('Guardian', getGuardianName(profile)),
  ];
  return rows.filter((entry): entry is RecordRow => entry != null);
}

function row(label: string, value: string | undefined): RecordRow | null {
  return value ? { label, value } : null;
}
