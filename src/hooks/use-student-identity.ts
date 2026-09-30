import { useGetAssessmentGradesQuery } from '@/api/grades/grades-api';
import { useAuth } from '@/hooks/use-auth';

/**
 * Display identity for the signed-in student, shared by Home and My profile.
 *
 * NEMIS has no standalone "my class" field on the student's profile or
 * dashboard summary — `className` only comes back on assessment grade
 * records, so that's the source (same cached query Home's Recent Grades
 * reads, not an extra request). Undefined until a grade is published.
 */
export function useStudentIdentity() {
  const { user } = useAuth();
  const { data: grades } = useGetAssessmentGradesQuery();

  const studentClass = grades?.find((grade) => grade.className)?.className;
  const schoolName = user?.institution?.name;

  return {
    user,
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    initials: user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : '',
    studentClass,
    schoolName,
    /** e.g. "Grade 5B · Monrovia Central High" — class and/or school. */
    classAndSchool: [studentClass, schoolName].filter(Boolean).join(' · '),
  };
}
