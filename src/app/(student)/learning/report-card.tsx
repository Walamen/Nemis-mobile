import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useGetGradingConfigQuery, useGetReportCardQuery } from '@/api/grades/grades-api';
import { ReportCardTable } from '@/components/cards/report-card-table';
import { EmptyState } from '@/components/common/empty-state';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { ThemedText } from '@/components/typography/themed-text';
import { Palette } from '@/theme';

// Cycled across the grade scale's letters purely for visual distinction —
// not semantically tied to any one letter grade.
const GRADE_COLORS = [
  Palette.success,
  Palette.secondary,
  Palette.warning,
  Palette.accent,
  Palette.error,
];

export default function ReportCardScreen() {
  const { data: reportCard, isLoading, isFetching, isError, refetch } = useGetReportCardQuery();
  // Same institution grading scale the web report card shows as a legend —
  // optional: the table itself renders raw scores either way.
  const { data: gradingConfig } = useGetGradingConfigQuery();
  const gradeScale = [...(gradingConfig?.gradeScale ?? [])].sort((a, b) => b.min - a.min);

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Report Card" />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!reportCard}
        onRetry={refetch}
        emptyFallback={
          <EmptyState
            icon={{ ios: 'doc.text', android: 'description', web: 'description' }}
            title="No report card available"
            description="You're not currently enrolled in an active class. Contact your school if this looks wrong."
          />
        }
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          {reportCard && (
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
          )}
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
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
