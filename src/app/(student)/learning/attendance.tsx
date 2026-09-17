import { useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { useGetMyAttendanceQuery } from '@/api/attendance/attendance-api';
import { AttendanceCalendar } from '@/components/cards/attendance-calendar';
import { AttendanceCard } from '@/components/cards/attendance-card';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { CardBackgroundColor } from '@/theme';
import { Pressable } from '@/tw';

export default function AttendanceScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetMyAttendanceQuery();
  const theme = useTheme();
  // `null` = "Overview" (today's merged, worst-status-wins view across every
  // subject) — attendance is really tracked per subject/day (see
  // `types/attendance.ts`), so picking a subject swaps both the stat card
  // and the calendar to that subject's own records, matching the web SIS
  // app's subject-tabbed attendance view.
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const subjects = data?.subjects ?? [];
  const selectedSubject = subjects.find((s) => s.subjectId === selectedSubjectId) ?? null;
  const cardSource = selectedSubject ? selectedSubject.summary : data?.summary;
  const calendarSubjects = selectedSubject ? [selectedSubject] : subjects;

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Attendance" />
      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          <AttendanceCard
            percentage={cardSource?.percentage ?? 0}
            present={cardSource?.present ?? 0}
            absent={cardSource?.absent ?? 0}
            late={cardSource?.late ?? 0}
            excused={cardSource?.excused}
            backgroundColor={CardBackgroundColor}
            className="mb-4"
          />

          <AttendanceCalendar
            subjects={calendarSubjects}
            backgroundColor={CardBackgroundColor}
            className="mb-4"
          />

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
    </AppScreen>
  );
}
