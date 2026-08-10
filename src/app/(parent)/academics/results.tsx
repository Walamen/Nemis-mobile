import type { Href } from 'expo-router';
import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetChildAssessmentGradesQuery } from '@/api/parent/academics-api';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { QueryState } from '@/components/common/query-state';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { useTheme } from '@/hooks/use-theme';
import { Link } from '@/tw';

export default function ResultsScreen() {
  const { selectedChildId } = useSelectedChild();
  const theme = useTheme();
  const {
    data: grades,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetChildAssessmentGradesQuery(
    { childId: selectedChildId ?? '' },
    { skip: !selectedChildId },
  );

  const average = grades?.length
    ? grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length
    : null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={grades?.length === 0}
        emptyMessage="No published results yet."
        onRetry={refetch}
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          <ChildSwitcher />

          {average !== null && (
            <ThemedView type="backgroundElement" className="mb-4 gap-1 rounded-card p-4">
              <ThemedText type="small" themeColor="textSecondary">
                Average across published results
              </ThemedText>
              <ThemedText type="subtitle" style={{ fontSize: 24 }}>
                {average.toFixed(1)}%
              </ThemedText>
            </ThemedView>
          )}

          <Link
            href={'/academics/report-card' as Href}
            className="mb-4 rounded-card p-4"
            style={{ backgroundColor: theme.backgroundElement }}
          >
            <ThemedText type="smallBold">View report card</ThemedText>
          </Link>

          {grades?.map((grade) => (
            <ThemedView
              key={grade.id}
              type="backgroundElement"
              className="mb-2 gap-1 rounded-card p-4"
            >
              <ThemedView className="flex-row items-center justify-between">
                <ThemedText type="smallBold">{grade.title}</ThemedText>
                <ThemedText type="smallBold">{grade.grade}</ThemedText>
              </ThemedView>
              <ThemedText type="small" themeColor="textSecondary">
                {grade.subject} · {grade.type} · {new Date(grade.date).toLocaleDateString()}
              </ThemedText>
              <ThemedText type="small">
                {grade.score}/{grade.maxScore} ({grade.percentage.toFixed(1)}%)
              </ThemedText>
            </ThemedView>
          ))}
        </ScrollView>
      </QueryState>
    </SafeAreaView>
  );
}
