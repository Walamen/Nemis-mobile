import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import {
  useGetGradingConfigQuery,
  useGetReportCardQuery,
  useGetReportCardYearsQuery,
} from '@/api/grades/grades-api';
import { ReportCardTable } from '@/components/cards/report-card-table';
import { ReportCardView } from '@/components/cards/report-card-view';
import { AcademicYearPicker } from '@/components/common/academic-year-picker';
import { EmptyState } from '@/components/common/empty-state';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { ThemedText } from '@/components/typography/themed-text';
import { Palette } from '@/theme';
import type { ReportCard } from '@/types/grades';
import { forSelectedChild } from '@/utils/selected-child';

// Cycled across the grade scale's letters purely for visual distinction —
// not semantically tied to any one letter grade.
const GRADE_COLORS = [
  Palette.success,
  Palette.secondary,
  Palette.warning,
  Palette.accent,
  Palette.error,
];

/** Simplified grid + grading legend — only for a server that doesn't send the full card. */
function LegacyReportCard({ reportCard }: { reportCard: ReportCard }) {
  const { data: gradingConfig } = useGetGradingConfigQuery();
  const gradeScale = [...(gradingConfig?.gradeScale ?? [])].sort((a, b) => b.min - a.min);
  return (
    <>
      <ThemedText type="subtitle" className="mb-1">
        {reportCard.studentName}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" className="mb-4">
        {reportCard.className} · {reportCard.academicYear}
      </ThemedText>
      <ReportCardTable reportCard={reportCard} />
      {gradeScale.length > 0 && (
        <View style={styles.legend}>
          <ThemedText type="smallBold" className="mb-2">
            Method of Grading
          </ThemedText>
          <View style={styles.legendGrid}>
            {gradeScale.map((item, index) => (
              <View key={item.letter} style={styles.legendItem}>
                <ThemedText
                  type="smallBold"
                  style={{ color: GRADE_COLORS[index % GRADE_COLORS.length] }}
                >
                  {item.letter}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.min}–{item.max} · {item.description}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}
    </>
  );
}

/**
 * The student's report card as the school issued it (`ReportCardView`, the
 * web SIS layout), with a year picker once they hold cards for more than one
 * year. No year chosen = the server's default (this year's card, or the
 * newest one — so a closed year's final card shows right after close).
 */
export default function ReportCardScreen() {
  const [yearId, setYearId] = useState<string | undefined>();
  // `forSelectedChild` keeps only the chosen year's data (`currentData`),
  // so a previous year's card never shows under a newly chosen year.
  const {
    data: reportCard,
    error,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = forSelectedChild(useGetReportCardQuery(yearId));
  const { data: years = [], refetch: refetchYears } = useGetReportCardYearsQuery();

  function refreshAll() {
    refetch();
    refetchYears();
  }

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Report Card" />
      <View style={styles.picker}>
        <AcademicYearPicker
          years={years}
          value={yearId ?? reportCard?.academicYearId}
          onChange={setYearId}
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
                : 'Your report card appears here once your school issues one.'
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
            reportCard && <LegacyReportCard reportCard={reportCard} />
          )}
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  picker: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  legend: {
    marginTop: 20,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    minWidth: '45%',
    gap: 2,
  },
});
