import { useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { useGetAssignmentsQuery, useSubmitAssignmentMutation } from '@/api/tasks/assignments-api';
import { Button } from '@/components/buttons/button';
import { AssignmentCard } from '@/components/cards/assignment-card';
import { EmptyState } from '@/components/common/empty-state';
import { FilterPills } from '@/components/common/filter-pills';
import { QueryState } from '@/components/common/query-state';
import { TextField } from '@/components/forms/text-field';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { BottomSheet } from '@/components/layout/bottom-sheet';
import { SkeletonList } from '@/components/loading/skeleton-list';
import { ThemedText } from '@/components/typography/themed-text';
import { CardBackgroundColor } from '@/theme';
import type { Assignment } from '@/types/tasks';
import { Text, View } from '@/tw';
import { getApiErrorMessage } from '@/utils/api-error';
import { formatDueLabel } from '@/utils/date';

type Filter = 'due' | 'submitted' | 'graded';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'due', label: 'Due' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'graded', label: 'Graded' },
];

function matchesFilter(assignment: Assignment, filter: Filter): boolean {
  const status = assignment.mySubmission?.status;
  if (filter === 'due') return !status || status === 'PENDING';
  if (filter === 'graded') return status === 'GRADED';
  return status === 'SUBMITTED' || status === 'LATE';
}

export default function AssignmentsScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetAssignmentsQuery();
  const [submitAssignment, { isLoading: isSubmitting }] = useSubmitAssignmentMutation();
  const [filter, setFilter] = useState<Filter>('due');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [response, setResponse] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const filtered = data?.filter((a) => matchesFilter(a, filter));

  function openAssignment(assignment: Assignment) {
    setSubmitError(null);
    setResponse(assignment.mySubmission?.response ?? '');
    setSelectedAssignment(assignment);
  }

  async function handleSubmit() {
    if (!selectedAssignment) return;
    setSubmitError(null);
    try {
      await submitAssignment({ assignmentId: selectedAssignment.id, response }).unwrap();
      setSelectedAssignment(null);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  }

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Assignments" />
      <QueryState
        isLoading={isLoading}
        isError={isError}
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
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
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
              status={assignment.mySubmission?.status ?? 'PENDING'}
              onPress={() => openAssignment(assignment)}
              backgroundColor={CardBackgroundColor}
              className="mb-2"
            />
          ))}
        </ScrollView>
      </QueryState>

      <BottomSheet
        visible={!!selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        title={selectedAssignment?.title}
      >
        {selectedAssignment && (
          <View className="gap-3">
            <ThemedText type="small" themeColor="textSecondary">
              {selectedAssignment.subjectName ?? selectedAssignment.className} ·{' '}
              {formatDueLabel(selectedAssignment.dueDate)}
            </ThemedText>
            {selectedAssignment.instructions && (
              <ThemedText type="small">{selectedAssignment.instructions}</ThemedText>
            )}
            <TextField
              label="Your response"
              value={response}
              onChangeText={setResponse}
              placeholder="Type your answer…"
              multiline
              numberOfLines={4}
              editable={!isSubmitting}
            />
            {submitError && <Text className="text-sm text-error">{submitError}</Text>}
            <Button label="Submit" onPress={handleSubmit} isLoading={isSubmitting} />
          </View>
        )}
      </BottomSheet>
    </AppScreen>
  );
}
