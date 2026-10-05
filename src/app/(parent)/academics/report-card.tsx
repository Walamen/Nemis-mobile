import { RefreshControl, ScrollView } from 'react-native';

import { useGetChildReportCardQuery } from '@/api/parent/academics-api';
import { ReportCardTable } from '@/components/cards/report-card-table';
import { ChildGate } from '@/components/common/child-gate';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { EmptyState } from '@/components/common/empty-state';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { ThemedText } from '@/components/typography/themed-text';
import { useSelectedChild } from '@/hooks/use-selected-child';

/**
 * The selected child's report card, rendered with the same
 * `ReportCardTable` grid as the Student Report Card — the parent endpoint
 * returns the identical `ReportCard` shape.
 */
function ReportCard() {
  const { selectedChildId } = useSelectedChild();
  const {
    data: reportCard,
    error,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetChildReportCardQuery(selectedChildId ?? '', { skip: !selectedChildId });

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError && !reportCard}
      error={error}
      isEmpty={!reportCard}
      onRetry={refetch}
      emptyFallback={
        <EmptyState
          icon={{ ios: 'doc.text', android: 'description', web: 'description' }}
          title="No report card available"
          description="A report card appears once your child is enrolled in an active class and results are published."
        />
      }
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        <ChildSwitcher />
        {reportCard && (
          <>
            <ThemedText type="subtitle" className="mb-1">
              {reportCard.studentName}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" className="mb-4">
              {reportCard.className} · {reportCard.academicYear}
            </ThemedText>
            <ReportCardTable reportCard={reportCard} />
          </>
        )}
      </ScrollView>
    </QueryState>
  );
}

export default function ReportCardScreen() {
  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Report card" />
      <ChildGate>
        <ReportCard />
      </ChildGate>
    </AppScreen>
  );
}
