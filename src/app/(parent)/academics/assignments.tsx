import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetChildAssignmentsQuery } from '@/api/parent/assignments-api';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useSelectedChild } from '@/hooks/use-selected-child';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Not submitted',
  SUBMITTED: 'Submitted',
  GRADED: 'Graded',
  LATE: 'Submitted late',
  MISSING: 'Missing',
};

export default function AssignmentsScreen() {
  const { selectedChildId } = useSelectedChild();
  const {
    data: assignments,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetChildAssignmentsQuery(selectedChildId ?? '', { skip: !selectedChildId });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={assignments?.length === 0}
        emptyMessage="No assignments yet."
        onRetry={refetch}
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          <ChildSwitcher />

          {assignments?.map((assignment) => (
            <ThemedView key={assignment.id} type="backgroundElement" className="mb-2 gap-1 rounded-card p-4">
              <ThemedText type="smallBold">{assignment.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {assignment.subject ?? 'General'} · Due{' '}
                {new Date(assignment.dueDate).toLocaleDateString()}
              </ThemedText>
              <ThemedText type="small">
                {STATUS_LABEL[assignment.status] ?? assignment.status}
                {assignment.grade !== null ? ` · ${assignment.grade}/${assignment.totalMarks}` : ''}
              </ThemedText>
              {assignment.feedback && (
                <ThemedText type="small" themeColor="textSecondary">
                  Feedback: {assignment.feedback}
                </ThemedText>
              )}
            </ThemedView>
          ))}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
