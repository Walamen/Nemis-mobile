import { useGetAssessmentGradesQuery } from '@/api/grades/grades-api';
import { useGetMyStudentProfileQuery } from '@/api/student/student-profile-api';
import { useAuth } from '@/hooks/use-auth';
import { getCurrentClassName } from '@/utils/student-record';

/**
 * Display identity for the signed-in student, shared by Home and My profile.
 *
 * The class comes from the active enrollment on `GET /student/profile/me`;
 * if that isn't loaded (or has no active enrollment), it falls back to the
 * `className` on published assessment grades — the same cached query Home's
 * Recent Grades already reads.
 */
export function useStudentIdentity() {
  const { user } = useAuth();
  const { data: profile } = useGetMyStudentProfileQuery();
  const { data: grades } = useGetAssessmentGradesQuery();

  const studentClass =
    getCurrentClassName(profile) ?? grades?.find((grade) => grade.className)?.className;
  const schoolName = user?.institution?.name;

  return {
    user,
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    initials: user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : '',
    studentClass,
    schoolName,
    /** e.g. "Grade 5B · J.J. Roberts Elementary" — class and/or school. */
    classAndSchool: [studentClass, schoolName].filter(Boolean).join(' · '),
  };
}
