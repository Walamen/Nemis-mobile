import { useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetChildAssignmentsQuery } from '@/api/parent/assignments-api';
import {
  ASSIGNMENT_STATUS_LABEL,
  ASSIGNMENT_STATUS_TONE,
} from '@/components/cards/assignment-card';
import { Badge } from '@/components/common/badge';
import { Card } from '@/components/common/card';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { FilterPills } from '@/components/common/filter-pills';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { useSelectedChild } from '@/hooks/use-selected-child';
import type { ChildAssignment } from '@/types/tasks';
import { formatDueLabel } from '@/utils/date';

type Filter = 'due' | 'submitted' | 'graded';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'due', label: 'Due' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'graded', label: 'Graded' },
];

function matchesFilter(assignment: ChildAssignment, filter: Filter): boolean {
  if (filter === 'due') return assignment.status === 'PENDING' || assignment.status === 'MISSING';
  if (filter === 'graded') return assignment.status === 'GRADED';
  return assignment.status === 'SUBMITTED' || assignment.status === 'LATE';
}

export default function AssignmentsScreen() {
  const { selectedChildId } = useSelectedChild();
  const [filter, setFilter] = useState<Filter>('due');
  const {
    data: assignments,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetChildAssignmentsQuery(selectedChildId ?? '', { skip: !selectedChildId });

  const filtered = assignments?.filter((a) => matchesFilter(a, filter));

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

          <FilterPills options={FILTERS} value={filter} onChange={setFilter} className="mb-4" />

          {filtered?.length === 0 && (
            <ThemedText type="small" themeColor="textSecondary">
              No assignments in this filter.
            </ThemedText>
          )}

          {filtered?.map((assignment) => (
            <Card key={assignment.id} className="mb-2 gap-1">
              <ThemedText type="smallBold">{assignment.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {assignment.subject ?? 'General'} · {formatDueLabel(assignment.dueDate)}
              </ThemedText>
              <Badge
                label={ASSIGNMENT_STATUS_LABEL[assignment.status]}
                tone={ASSIGNMENT_STATUS_TONE[assignment.status]}
              />
              {assignment.grade !== null && (
                <ThemedText type="small">
                  Grade: {assignment.grade}/{assignment.totalMarks}
                </ThemedText>
              )}
              {assignment.feedback && (
                <ThemedText type="small" themeColor="textSecondary">
                  Feedback: {assignment.feedback}
                </ThemedText>
              )}
            </Card>
          ))}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
