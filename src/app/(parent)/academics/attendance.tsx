import { useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetChildAttendanceQuery } from '@/api/parent/attendance-api';
import { AttendanceCalendar } from '@/components/cards/attendance-calendar';
import { AttendanceCard } from '@/components/cards/attendance-card';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { useTheme } from '@/hooks/use-theme';
import { Pressable } from '@/tw';

export default function AttendanceScreen() {
  const { selectedChildId } = useSelectedChild();
  const { data, isLoading, isFetching, isError, refetch } = useGetChildAttendanceQuery(
    { childId: selectedChildId ?? '' },
    { skip: !selectedChildId },
  );
  const theme = useTheme();
  // `null` = "Overview" (today's merged, worst-status-wins view across every
  // subject) — attendance is really tracked per subject/day (see
  // `types/attendance.ts`), so picking a subject swaps both the stat card
  // and the calendar to that subject's own records, mirroring the student
  // Attendance screen and the web SIS app's subject-tabbed view.
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const subjects = data?.subjects ?? [];
  const selectedSubject = subjects.find((s) => s.subjectId === selectedSubjectId) ?? null;
  const cardSource = selectedSubject ? selectedSubject.summary : data?.summary;
  const calendarSubjects = selectedSubject ? [selectedSubject] : subjects;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          <ChildSwitcher />

          <AttendanceCard
            percentage={cardSource?.percentage ?? 0}
            present={cardSource?.present ?? 0}
            absent={cardSource?.absent ?? 0}
            late={cardSource?.late ?? 0}
            excused={cardSource?.excused}
            className="mb-4"
          />

          <AttendanceCalendar subjects={calendarSubjects} className="mb-4" />

          {subjects.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              className="mb-4 -mx-1"
            >
              <Pressable
                className="mx-1 rounded-full px-4 py-2"
                style={{
                  backgroundColor:
                    selectedSubjectId === null ? theme.backgroundSelected : theme.backgroundElement,
                }}
                onPress={() => setSelectedSubjectId(null)}
              >
                <ThemedText type="smallBold">Overview</ThemedText>
              </Pressable>
              {subjects.map((subject) => {
                const isSelected = subject.subjectId === selectedSubjectId;
                return (
                  <Pressable
                    key={subject.subjectId}
                    className="mx-1 rounded-full px-4 py-2"
                    style={{
                      backgroundColor: isSelected
                        ? theme.backgroundSelected
                        : theme.backgroundElement,
                    }}
                    onPress={() => setSelectedSubjectId(subject.subjectId)}
                  >
                    <ThemedText type="smallBold">
                      {subject.subjectName} · {subject.summary.percentage}%
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
