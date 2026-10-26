import type { Href } from 'expo-router';
import { RefreshControl, ScrollView } from 'react-native';

import { useGetChildAssessmentGradesQuery } from '@/api/parent/academics-api';
import { useGetChildAssignmentsQuery } from '@/api/parent/assignments-api';
import { useGetChildAttendanceQuery } from '@/api/parent/attendance-api';
import { HubCard } from '@/components/cards/hub-card';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { HeroBanner } from '@/components/common/hero-banner';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/theme';
import { View } from '@/tw';
import { forSelectedChild } from '@/utils/selected-child';

/**
 * Academics hub — same hub shape as the Student Academics tab (`HubCard`s
 * on the themed card surface), for the selected child: Report, Assignments,
 * Attendance (the parent side has no Subjects/Class Schedule screens). Hubs
 * render immediately; each card's stats appear once its own query resolves
 * (docs/UI_PATTERNS.md §6).
 */
export default function AcademicsMenuScreen() {
  const theme = useTheme();
  const { selectedChild, selectedChildId, refetch: refetchChildren } = useSelectedChild();
  const skip = !selectedChildId;
  const gradesQuery = forSelectedChild(
    useGetChildAssessmentGradesQuery({ childId: selectedChildId ?? '' }, { skip }),
  );
  const assignmentsQuery = forSelectedChild(
    useGetChildAssignmentsQuery(selectedChildId ?? '', { skip }),
  );
  const attendanceQuery = forSelectedChild(
    useGetChildAttendanceQuery({ childId: selectedChildId ?? '' }, { skip }),
  );

  const grades = gradesQuery.data;
  const assignments = assignmentsQuery.data;
  const attendance = attendanceQuery.data;
  const average = grades?.length
    ? grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length
    : undefined;
  const dueCount = assignments?.filter((a) => a.status === 'PENDING').length ?? 0;
  const gradedCount = assignments?.filter((a) => a.status === 'GRADED').length ?? 0;

  const isRefreshing =
    gradesQuery.isFetching || assignmentsQuery.isFetching || attendanceQuery.isFetching;
  function refreshAll() {
    refetchChildren();
    if (!skip) {
      gradesQuery.refetch();
      assignmentsQuery.refetch();
      attendanceQuery.refetch();
    }
  }

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Academics" showBack={false} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshAll} />}
      >
        <ChildSwitcher />
        <HeroBanner
          title={selectedChild ? `${selectedChild.firstName}'s academic record` : 'Academic record'}
          subtitle="Report, report card, assignments, and attendance — all in one place."
        />

        <View style={{ gap: 10, marginTop: 16 }}>
          <HubCard
            icon={{ ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' }}
            title="Report"
            description="Published assessment results, newest first."
            href={'/academics/results' as Href}
            backgroundColor={theme.card}
            iconColor={Palette.accent}
            stats={average != null ? [`Average ${average.toFixed(1)}%`] : undefined}
          />

          <HubCard
            icon={{ ios: 'doc.text', android: 'description', web: 'description' }}
            title="Report card"
            description="Every subject's scores by term, as the school publishes them."
            href={'/academics/report-card' as Href}
            backgroundColor={theme.card}
            iconColor={Palette.accent}
          />

          <HubCard
            icon={{ ios: 'checklist', android: 'checklist', web: 'checklist' }}
            title="Assignments"
            description="What's due, submitted, and graded for this child."
            href={'/tasks/assignments' as Href}
            backgroundColor={theme.card}
            iconColor={Palette.accent}
            badge={dueCount > 0 ? `${dueCount} due` : undefined}
            stats={
              assignments ? [`${assignments.length} total`, `${gradedCount} graded`] : undefined
            }
          />

          <HubCard
            icon={{ ios: 'checkmark.circle', android: 'event_available', web: 'event_available' }}
            title="Attendance"
            description="Attendance rate, and how it breaks down by subject."
            href={'/academics/attendance' as Href}
            backgroundColor={theme.card}
            iconColor={Palette.accent}
            stats={
              attendance && attendance.summary.totalDays > 0
                ? [
                    `${attendance.summary.percentage}% present`,
                    `${attendance.summary.absent} absence${attendance.summary.absent === 1 ? '' : 's'}`,
                    `${attendance.summary.late} late`,
                  ]
                : undefined
            }
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}
