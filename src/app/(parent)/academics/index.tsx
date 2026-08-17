import type { Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetChildAssessmentGradesQuery } from '@/api/parent/academics-api';
import { useGetChildAssignmentsQuery } from '@/api/parent/assignments-api';
import { useGetChildAttendanceQuery } from '@/api/parent/attendance-api';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { HeroBanner } from '@/components/common/hero-banner';
import { HubCard } from '@/components/cards/hub-card';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { ScrollView } from '@/tw';

/**
 * Academics hub — links to Report, Assignments, and Attendance for the
 * selected child (Subjects/Class Schedule stay student-only — the parent
 * side has no such screens/data today). Stat pills are real, already-
 * fetched figures for the selected child; the queries here double as a
 * cache-warm for the destination screens. See docs/PRODUCT_DECISIONS.md.
 */
export default function AcademicsMenuScreen() {
  const { selectedChild, selectedChildId } = useSelectedChild();
  const { data: grades } = useGetChildAssessmentGradesQuery(
    { childId: selectedChildId ?? '' },
    { skip: !selectedChildId },
  );
  const { data: assignments } = useGetChildAssignmentsQuery(selectedChildId ?? '', {
    skip: !selectedChildId,
  });
  const { data: attendance } = useGetChildAttendanceQuery(
    { childId: selectedChildId ?? '' },
    { skip: !selectedChildId },
  );

  const average = grades?.length
    ? grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length
    : undefined;
  const dueCount = assignments?.filter((a) => a.status === 'PENDING').length ?? 0;
  const gradedCount = assignments?.filter((a) => a.status === 'GRADED').length;

  return (
    <SafeAreaView className="flex-1 gap-2 px-4 pt-4">
      <ChildSwitcher />

      <ScrollView className="flex-1" contentContainerStyle={{ gap: 10, paddingBottom: 16 }}>
        <HeroBanner
          title={selectedChild ? `${selectedChild.firstName}'s academic record` : 'Academic record'}
          subtitle="Report, assignments, and attendance — all in one place."
        />

        <HubCard
          icon={{ ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' }}
          title="Report"
          description="Published assessment results and the full report card."
          href={'/academics/results' as Href}
          stats={average != null ? [`Average ${average.toFixed(1)}%`] : undefined}
        />

        <HubCard
          icon={{ ios: 'checklist', android: 'checklist', web: 'checklist' }}
          title="Assignment"
          description="What's due, submitted, and graded for this child."
          href={'/tasks/assignments' as Href}
          badge={dueCount > 0 ? `${dueCount} due` : undefined}
          stats={
            assignments ? [`${assignments.length} total`, `${gradedCount ?? 0} graded`] : undefined
          }
        />

        <HubCard
          icon={{ ios: 'checkmark.circle', android: 'event_available', web: 'event_available' }}
          title="Attendance"
          description="Attendance rate this term, and how it breaks down by subject."
          href={'/academics/attendance' as Href}
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
