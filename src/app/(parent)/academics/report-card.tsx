import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetChildReportCardQuery } from '@/api/parent/academics-api';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useSelectedChild } from '@/hooks/use-selected-child';

export default function ReportCardScreen() {
  const { selectedChildId } = useSelectedChild();
  const {
    data: reportCard,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetChildReportCardQuery(selectedChildId ?? '', { skip: !selectedChildId });

  const scoreByKey = new Map(
    reportCard?.grades.map((grade) => [`${grade.subjectId}::${grade.periodId}`, grade.score]),
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!reportCard}
        emptyMessage="No report card available yet."
        onRetry={refetch}
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
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

              {reportCard.subjects.map((subject) => (
                <ThemedView key={subject.id} type="backgroundElement" className="mb-3 gap-2 rounded-card p-4">
                  <ThemedText type="smallBold">{subject.name}</ThemedText>
                  {reportCard.terms.map((term) => (
                    <ThemedView key={term.id} className="gap-1">
                      <ThemedText type="small" themeColor="textSecondary">
                        {term.name}
                      </ThemedText>
                      <ThemedView className="flex-row flex-wrap gap-2">
                        {term.periods.map((period) => {
                          const score = scoreByKey.get(`${subject.id}::${period.id}`);
                          return (
                            <ThemedView key={period.id} className="min-w-[28%] gap-0.5">
                              <ThemedText type="small" themeColor="textSecondary">
                                {period.name}
                              </ThemedText>
                              <ThemedText type="smallBold">
                                {score !== undefined ? `${score}%` : '—'}
                              </ThemedText>
                            </ThemedView>
                          );
                        })}
                      </ThemedView>
                    </ThemedView>
                  ))}
                </ThemedView>
              ))}
            </>
          )}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
