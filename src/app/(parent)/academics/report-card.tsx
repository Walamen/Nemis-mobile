import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import {
  useGetChildReportCardQuery,
  useGetChildReportCardYearsQuery,
} from '@/api/parent/academics-api';
import { ReportCardTable } from '@/components/cards/report-card-table';
import { ReportCardView } from '@/components/cards/report-card-view';
import { AcademicYearPicker } from '@/components/common/academic-year-picker';
import { ChildGate } from '@/components/common/child-gate';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { EmptyState } from '@/components/common/empty-state';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { ThemedText } from '@/components/typography/themed-text';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { forSelectedChild } from '@/utils/selected-child';

/**
 * The selected child's report card — the same `ReportCardView` as the
 * Student app (the web SIS layout), with a year picker once the child holds
 * cards for more than one year. The chosen year belongs to one child, so
 * switching child goes back to that child's default year.
 */
function ReportCard() {
  const { selectedChildId } = useSelectedChild();
  const [choice, setChoice] = useState<{ childId: string; yearId: string } | null>(null);
  const yearId = choice && choice.childId === selectedChildId ? choice.yearId : undefined;

  const skip = !selectedChildId;
  const {
    data: reportCard,
    error,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = forSelectedChild(
    useGetChildReportCardQuery(
      { childId: selectedChildId ?? '', academicYearId: yearId },
      { skip },
    ),
  );
  const { data: years = [], refetch: refetchYears } = forSelectedChild(
    useGetChildReportCardYearsQuery(selectedChildId ?? '', { skip }),
  );

  function refreshAll() {
    refetch();
    refetchYears();
  }

  return (
    <>
      <ChildSwitcher inset />
      <View style={styles.picker}>
        <AcademicYearPicker
          years={years}
          value={yearId ?? reportCard?.academicYearId}
          onChange={(id) => selectedChildId && setChoice({ childId: selectedChildId, yearId: id })}
        />
      </View>
      <QueryState
        isLoading={isLoading}
        isError={isError && !reportCard}
        error={error}
        isEmpty={!reportCard}
        onRetry={refreshAll}
        emptyFallback={
          <EmptyState
            icon={{ ios: 'doc.text', android: 'description', web: 'description' }}
            title={yearId ? 'No report card for this year' : 'No report card available'}
            description={
              yearId
                ? 'Choose another year above.'
                : "Your child's report card appears here once the school issues one."
            }
          />
        }
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refreshAll} />}
        >
          {reportCard?.payload ? (
            <ReportCardView
              payload={reportCard.payload}
              version={reportCard.version}
              status={reportCard.status}
            />
          ) : (
            // Older server: only the simplified grid.
            reportCard && (
              <>
                <ThemedText type="subtitle" className="mb-1">
                  {reportCard.studentName}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" className="mb-4">
                  {reportCard.className} · {reportCard.academicYear}
                </ThemedText>
                <ReportCardTable reportCard={reportCard} />
              </>
            )
          )}
        </ScrollView>
      </QueryState>
    </>
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

const styles = StyleSheet.create({
  picker: {
    paddingHorizontal: 16,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
});
