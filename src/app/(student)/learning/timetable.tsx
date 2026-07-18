import { RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetMyTimetableQuery } from '@/api/timetable/timetable-api';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { TIMETABLE_DAYS } from '@/types/timetable';
import { ScrollView } from '@/tw';

export default function TimetableScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetMyTimetableQuery();
  const days = TIMETABLE_DAYS.filter((day) => (data?.[day]?.length ?? 0) > 0);

  return (
    <SafeAreaView className="flex-1">
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={days.length === 0}
        emptyMessage="No timetable entries yet."
        onRetry={refetch}
      >
        <ScrollView
          className="flex-1 px-4 pt-4"
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          {days.map((day) => (
            <ThemedView key={day} className="mb-4 gap-2">
              <ThemedText type="smallBold">{day}</ThemedText>
              {data?.[day]?.map((entry) => (
                <ThemedView
                  key={entry.id}
                  type="backgroundElement"
                  className="flex-row items-center justify-between rounded-card p-4"
                >
                  <ThemedView className="gap-1">
                    <ThemedText type="small">{entry.subject?.name ?? 'Free period'}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {entry.teacher ? `${entry.teacher.firstName} ${entry.teacher.lastName}` : ''}
                      {entry.room ? ` · Room ${entry.room}` : ''}
                    </ThemedText>
                  </ThemedView>
                  <ThemedText type="small" themeColor="textSecondary">
                    {entry.startTime}–{entry.endTime}
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          ))}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
