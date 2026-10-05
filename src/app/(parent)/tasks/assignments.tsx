import { useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { useGetChildAssignmentsQuery } from '@/api/parent/assignments-api';
import {
  ASSIGNMENT_STATUS_LABEL,
  ASSIGNMENT_STATUS_TONE,
} from '@/components/cards/assignment-card';
import { Badge } from '@/components/common/badge';
import { Card } from '@/components/common/card';
import { ChildGate } from '@/components/common/child-gate';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { EmptyState } from '@/components/common/empty-state';
import { FilterPills } from '@/components/common/filter-pills';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SkeletonList } from '@/components/loading/skeleton-list';
import { ThemedText } from '@/components/typography/themed-text';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { useTheme } from '@/hooks/use-theme';
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

/** Read-only view of the selected child's assignments (parents can't submit). */
function Assignments() {
  const theme = useTheme();
  const { selectedChildId } = useSelectedChild();
  const [filter, setFilter] = useState<Filter>('due');
  const {
    data: assignments,
    error,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetChildAssignmentsQuery(selectedChildId ?? '', { skip: !selectedChildId });

  const filtered = assignments?.filter((a) => matchesFilter(a, filter));

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError && !assignments}
      error={error}
      isEmpty={assignments?.length === 0}
      onRetry={refetch}
      loadingFallback={<SkeletonList count={4} lines={3} className="px-4 pt-4" />}
      emptyFallback={
        <EmptyState
          icon={{ ios: 'checklist', android: 'checklist', web: 'checklist' }}
          title="No assignments yet"
          description="Assignments appear here once teachers post them."
        />
      }
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
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
          <Card
            key={assignment.id}
            backgroundColor={theme.card}
            className="mb-2 gap-1"
            accessibilityLabel={[
              assignment.title,
              assignment.subject ?? 'General',
              formatDueLabel(assignment.dueDate),
              ASSIGNMENT_STATUS_LABEL[assignment.status],
            ].join('. ')}
          >
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
  );
}

export default function AssignmentsScreen() {
  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Assignments" />
      <ChildGate loadingFallback={<SkeletonList count={4} lines={3} className="px-4 pt-4" />}>
        <Assignments />
      </ChildGate>
    </AppScreen>
  );
}
