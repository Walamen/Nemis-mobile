import type { Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetMyAttendanceQuery } from '@/api/attendance/attendance-api';
import { useGetResultsQuery } from '@/api/grades/grades-api';
import { useGetSubjectsQuery } from '@/api/student/subjects-api';
import { useGetMyTimetableQuery } from '@/api/timetable/timetable-api';
import { HubCard } from '@/components/cards/hub-card';
import { HeroBanner } from '@/components/common/hero-banner';
import { AppHeader } from '@/components/layout/app-header';
import { TIMETABLE_DAYS } from '@/types/timetable';
import { ScrollView } from '@/tw';

/**
 * Academics hub — matches the "NEMIS Mobile" Claude Design case study's
 * descriptive-card hub shape (`HubCard`). Each row's stat pills are real,
 * already-fetched figures (not the mockup's placeholder counts) — the
 * queries here double as a cache-warm for the destination screens, which
 * read the same endpoints. See docs/PRODUCT_DECISIONS.md.
 */
export default function LearningMenuScreen() {
  const { data: subjectsData } = useGetSubjectsQuery();
  const { data: timetable } = useGetMyTimetableQuery();
  const { data: terms } = useGetResultsQuery();
  const { data: attendance } = useGetMyAttendanceQuery();

  const uniqueTeachers = subjectsData
    ? new Set(subjectsData.subjects.map((s) => s.teacher.id)).size
    : undefined;

  const scheduledDays = timetable
    ? TIMETABLE_DAYS.filter((day) => (timetable[day]?.length ?? 0) > 0)
    : undefined;
  const allEntries = timetable ? Object.values(timetable).flat() : undefined;

  const currentTerm = terms?.[terms.length - 1];
  const termAverage = currentTerm?.termAverages.length
    ? currentTerm.termAverages.reduce((sum, s) => sum + s.average, 0) /
      currentTerm.termAverages.length
    : undefined;

  return (
    <SafeAreaView className="flex-1">
      {/* Tab root — no back destination, so force the back button off
          rather than relying on router.canGoBack()'s default. */}
      <AppHeader title="Academics" showBack={false} />
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 10 }}>
        <HeroBanner
          title="Your academic record"
          subtitle="Subjects, schedule, grades, and attendance — all in one place."
        />

        <HubCard
          icon={{ ios: 'book', android: 'menu_book', web: 'menu_book' }}
          title="Subjects"
          description="The subjects registered this term, each with its teacher, weekly periods, and how you're doing."
          href={'/learning/subjects' as Href}
          stats={
            subjectsData
              ? [
                  `${subjectsData.summary.totalSubjects} subjects`,
                  `${uniqueTeachers} teacher${uniqueTeachers === 1 ? '' : 's'}`,
                  `${subjectsData.summary.overallAttendance}% attendance`,
                ]
              : undefined
          }
        />

        <HubCard
          icon={{ ios: 'clock', android: 'schedule', web: 'schedule' }}
          title="Class Schedule"
          description="Your weekly timetable, day by day — lesson times, rooms, and which teacher takes each period."
          href={'/learning/timetable' as Href}
          stats={
            scheduledDays && allEntries
              ? [
                  `${scheduledDays.length} school day${scheduledDays.length === 1 ? '' : 's'}`,
                  `${allEntries.length} periods/week`,
                ]
              : undefined
          }
        />

        <HubCard
          icon={{ ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' }}
          title="Grades"
          description="Your term average, GPA, and a breakdown by subject."
          href={'/learning/grades' as Href}
          stats={
            currentTerm && termAverage != null
              ? [`Average ${termAverage.toFixed(1)}%`, `GPA ${currentTerm.gpa.toFixed(2)}`]
              : undefined
          }
        />

        <HubCard
          icon={{ ios: 'checkmark.circle', android: 'event_available', web: 'event_available' }}
          title="Attendance"
          description="Your attendance rate this term, and how it breaks down by subject."
          href={'/learning/attendance' as Href}
          stats={
            attendance
              ? [
                  `${attendance.summary.percentage}% present`,
                  `${attendance.summary.absent} absence${attendance.summary.absent === 1 ? '' : 's'}`,
                  `${attendance.summary.late} late`,
                ]
              : undefined
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}
