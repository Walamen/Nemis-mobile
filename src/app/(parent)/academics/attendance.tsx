import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetChildAttendanceQuery } from '@/api/parent/attendance-api';
import { AttendanceCalendar } from '@/components/cards/attendance-calendar';
import { AttendanceCard } from '@/components/cards/attendance-card';
import { Card } from '@/components/common/card';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { QueryState } from '@/components/common/query-state';
import { SectionHeader } from '@/components/layout/section-header';
import { ThemedText } from '@/components/typography/themed-text';
import { useSelectedChild } from '@/hooks/use-selected-child';

export default function AttendanceScreen() {
  const { selectedChildId } = useSelectedChild();
  const { data, isLoading, isFetching, isError, refetch } = useGetChildAttendanceQuery(
    { childId: selectedChildId ?? '' },
    { skip: !selectedChildId },
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          <ChildSwitcher />

          <AttendanceCard
            percentage={data?.summary.percentage ?? 0}
            present={data?.summary.present ?? 0}
            absent={data?.summary.absent ?? 0}
            late={data?.summary.late ?? 0}
            excused={data?.summary.excused}
            className="mb-4"
          />

          <AttendanceCalendar subjects={data?.subjects ?? []} className="mb-4" />

          <SectionHeader title="By subject" />

          {data?.subjects?.map((subject) => (
            <Card key={subject.subjectId} className="mb-2 flex-row items-center justify-between">
              <ThemedText type="small">{subject.subjectName}</ThemedText>
              <ThemedText type="smallBold">{subject.summary.percentage}%</ThemedText>
            </Card>
          ))}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
