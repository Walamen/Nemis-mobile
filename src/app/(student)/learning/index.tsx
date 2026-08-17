import type { Href } from 'expo-router';
import { RefreshControl, ScrollView } from 'react-native';

import { useGetMyAttendanceQuery } from '@/api/attendance/attendance-api';
import { useGetResultsQuery } from '@/api/grades/grades-api';
import { useGetSubjectsQuery } from '@/api/student/subjects-api';
import { useGetMyTimetableQuery } from '@/api/timetable/timetable-api';
import { HubCard } from '@/components/cards/hub-card';
import { HeroBanner } from '@/components/common/hero-banner';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { TIMETABLE_DAYS } from '@/types/timetable';

/**
 * Academics hub — matches the "NEMIS Mobile" Claude Design case study's
 * descriptive-card hub shape (`HubCard`). Each row's stat pills are real,
 * already-fetched figures (not the mockup's placeholder counts) — the
 * queries here double as a cache-warm for the destination screens, which
 * read the same endpoints. See docs/PRODUCT_DECISIONS.md.
 *
 * Uses `AppScreen` + `QueryState` (the same shell every sibling screen in
 * this stack — Subjects/Timetable/Grades/Attendance — already uses) rather
 * than a bespoke `SafeAreaView`, so it gets the same loading/error states,
 * safe-area handling, and pull-to-refresh as the rest of the app instead of
 * silently rendering an empty body while its four queries are in flight.
 */
export default function LearningMenuScreen() {
  const subjectsQuery = useGetSubjectsQuery();
  const timetableQuery = useGetMyTimetableQuery();
  const resultsQuery = useGetResultsQuery();
  const attendanceQuery = useGetMyAttendanceQuery();

  const { data: subjectsData } = subjectsQuery;
  const { data: timetable } = timetableQuery;
  const { data: terms } = resultsQuery;
  const { data: attendance } = attendanceQuery;

  const isLoading =
    subjectsQuery.isLoading ||
    timetableQuery.isLoading ||
    resultsQuery.isLoading ||
    attendanceQuery.isLoading;
  const isError =
    subjectsQuery.isError ||
    timetableQuery.isError ||
    resultsQuery.isError ||
    attendanceQuery.isError;
  const isFetching =
    subjectsQuery.isFetching ||
    timetableQuery.isFetching ||
    resultsQuery.isFetching ||
    attendanceQuery.isFetching;
  const refetch = () => {
    subjectsQuery.refetch();
    timetableQuery.refetch();
    resultsQuery.refetch();
    attendanceQuery.refetch();
  };

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
    <AppScreen scroll={false} contentClassName="">
      {/* Tab root — no back destination, so force the back button off
          rather than relying on router.canGoBack()'s default. */}
      <AppHeader title="Academics" showBack={false} />
      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
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
      </QueryState>
    </AppScreen>
  );
}
