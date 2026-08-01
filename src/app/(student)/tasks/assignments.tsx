import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetAssignmentsQuery } from '@/api/tasks/assignments-api';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Not submitted',
  SUBMITTED: 'Submitted',
  GRADED: 'Graded',
  LATE: 'Submitted late',
  MISSING: 'Missing',
};

export default function AssignmentsScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetAssignmentsQuery();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={data?.length === 0}
        emptyMessage="No assignments yet."
        onRetry={refetch}
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          {data?.map((assignment) => (
            <ThemedView
              key={assignment.id}
              type="backgroundElement"
              className="mb-2 gap-1 rounded-card p-4"
            >
              <ThemedText type="smallBold">{assignment.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {assignment.subjectName ?? assignment.className} · Due{' '}
                {new Date(assignment.dueDate).toLocaleDateString()}
              </ThemedText>
              <ThemedText type="small">
                {assignment.mySubmission
                  ? (STATUS_LABEL[assignment.mySubmission.status] ?? assignment.mySubmission.status)
                  : 'Not submitted'}
              </ThemedText>
            </ThemedView>
          ))}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
