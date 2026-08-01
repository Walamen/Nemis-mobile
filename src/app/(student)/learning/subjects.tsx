import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetSubjectsQuery } from '@/api/student/subjects-api';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';

export default function SubjectsScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetSubjectsQuery();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!data?.subjects?.length}
        emptyMessage="No subjects found."
        onRetry={refetch}
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          {data?.subjects?.map((subject) => (
            <ThemedView
              key={subject.id}
              type="backgroundElement"
              className="mb-3 gap-2 rounded-card p-4"
            >
              <ThemedText type="smallBold">{subject.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {subject.teacher.firstName} {subject.teacher.lastName}
              </ThemedText>
              <ThemedView className="flex-row justify-between">
                <ThemedText type="small">Grade: {subject.performance.letterGrade}</ThemedText>
                <ThemedText type="small">Attendance: {subject.attendance.rate}%</ThemedText>
              </ThemedView>
            </ThemedView>
          ))}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
