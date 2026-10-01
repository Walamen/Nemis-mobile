import { useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { AssignmentDetails } from '@/components/assignments/assignment-details';
import { AssignmentCard } from '@/components/cards/assignment-card';
import { EmptyState } from '@/components/common/empty-state';
import { FilterPills } from '@/components/common/filter-pills';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { BottomSheet } from '@/components/layout/bottom-sheet';
import { SkeletonList } from '@/components/loading/skeleton-list';
import { ThemedText } from '@/components/typography/themed-text';
import { useLiveAssignments } from '@/hooks/use-live-assignments';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useTheme } from '@/hooks/use-theme';
import {
  getSubmissionStatus,
  matchesAssignmentFilter,
  type AssignmentFilter,
} from '@/utils/assignments';

const FILTERS: { key: AssignmentFilter; label: string }[] = [
  { key: 'due', label: 'Due' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'graded', label: 'Graded' },
];

export default function AssignmentsScreen() {
  const theme = useTheme();
  // Real-time + focus + in-view polling — see `useLiveAssignments`.
  const { data, error, isLoading, isError, refetch, fulfilledTimeStamp } = useLiveAssignments();
  const pullToRefresh = usePullToRefresh(refetch);
  const [filter, setFilter] = useState<AssignmentFilter>('due');
  // Stored by id so the open sheet always shows the latest cached version
  // (e.g. the updated status right after a submission).
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = data?.filter((assignment) => matchesAssignmentFilter(assignment, filter));
  const selectedAssignment = data?.find((assignment) => assignment.id === selectedId) ?? null;

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Assignments" />
      <QueryState
        isLoading={isLoading}
        // A failed background refresh keeps showing the cached list.
        isError={isError && !data}
        error={error}
        isEmpty={data?.length === 0}
        onRetry={refetch}
        loadingFallback={<SkeletonList count={4} lines={3} className="px-4 pt-4" />}
        emptyFallback={
          <EmptyState
            icon={{ ios: 'checklist', android: 'checklist', web: 'checklist' }}
            title="No assignments yet"
            description="You're all caught up!"
          />
        }
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={<RefreshControl {...pullToRefresh} />}
        >
          <FilterPills options={FILTERS} value={filter} onChange={setFilter} className="mb-4" />

          {filtered?.length === 0 && (
            <ThemedText type="small" themeColor="textSecondary">
              No assignments in this filter.
            </ThemedText>
          )}

          {filtered?.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              title={assignment.title}
              subjectLabel={assignment.subjectName ?? assignment.className}
              dueDate={assignment.dueDate}
              status={getSubmissionStatus(assignment)}
              onPress={() => setSelectedId(assignment.id)}
              backgroundColor={theme.card}
              className="mb-2"
            />
          ))}
        </ScrollView>
      </QueryState>

      <BottomSheet
        visible={!!selectedAssignment}
        onClose={() => setSelectedId(null)}
        title={selectedAssignment?.title}
      >
        {selectedAssignment && (
          <AssignmentDetails
            // Fresh per assignment, so "Submitted" feedback doesn't carry over.
            key={selectedAssignment.id}
            assignment={selectedAssignment}
            // Due/closed rules are judged as of the last fetch (pure render).
            now={fulfilledTimeStamp ?? 0}
          />
        )}
      </BottomSheet>
    </AppScreen>
  );
}
