import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetChildAttendanceQuery } from '@/api/parent/attendance-api';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
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

          <ThemedView type="backgroundElement" className="mb-4 gap-2 rounded-card p-4">
            <ThemedText type="subtitle" className="text-2xl">
              {data?.summary.percentage ?? 0}%
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {data?.summary.present ?? 0} present · {data?.summary.absent ?? 0} absent ·{' '}
              {data?.summary.late ?? 0} late · {data?.summary.excused ?? 0} excused
            </ThemedText>
          </ThemedView>

          <ThemedText type="sectionHeading" className="mb-2">
            By subject
          </ThemedText>

          {data?.subjects?.map((subject) => (
            <ThemedView
              key={subject.subjectId}
              type="backgroundElement"
              className="mb-2 flex-row items-center justify-between rounded-card p-4"
            >
              <ThemedText type="small">{subject.subjectName}</ThemedText>
              <ThemedText type="smallBold">{subject.summary.percentage}%</ThemedText>
            </ThemedView>
          ))}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
