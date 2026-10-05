import type { Href } from 'expo-router';
import { RefreshControl, ScrollView } from 'react-native';

import { useGetChildAssessmentGradesQuery } from '@/api/parent/academics-api';
import { Badge } from '@/components/common/badge';
import { Card } from '@/components/common/card';
import { ChildGate } from '@/components/common/child-gate';
import { ChildSwitcher } from '@/components/common/child-switcher';
import { EmptyState } from '@/components/common/empty-state';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SkeletonList } from '@/components/loading/skeleton-list';
import { ThemedText } from '@/components/typography/themed-text';
import { useSelectedChild } from '@/hooks/use-selected-child';
import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/theme';
import { Link, View } from '@/tw';

const HERO_LABEL = '#B3D9ED';
const WHITE = '#FFFFFF';

function Results() {
  const theme = useTheme();
  const { selectedChildId } = useSelectedChild();
  const {
    data: grades,
    error,
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
    <QueryState
      isLoading={isLoading}
      isError={isError && !grades}
      error={error}
      isEmpty={grades?.length === 0}
      onRetry={refetch}
      loadingFallback={<SkeletonList count={4} lines={2} className="px-4 pt-4" />}
      emptyFallback={
        <EmptyState
          icon={{ ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' }}
          title="No published results yet"
          description="Results appear here once teachers publish them."
        />
      }
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        <ChildSwitcher />

        {/* Same navy hero treatment as the Student Grades screen. */}
        {average !== null && (
          <View
            className="gap-1 rounded-card p-5"
            style={{ backgroundColor: Palette.primary }}
            accessible
            accessibilityLabel={`Average across published results: ${average.toFixed(1)}%`}
          >
            <ThemedText type="small" style={{ color: HERO_LABEL }}>
              Average across published results
            </ThemedText>
            <ThemedText type="title" style={{ color: WHITE, fontSize: 38, lineHeight: 42 }}>
              {average.toFixed(1)}%
            </ThemedText>
          </View>
        )}

        <Link
          href={'/academics/report-card' as Href}
          className="mb-4 mt-4 rounded-card p-4"
          style={{ backgroundColor: theme.backgroundElement }}
        >
          <ThemedText type="smallBold">View report card</ThemedText>
        </Link>

        <View className="gap-2">
          {grades?.map((grade) => (
            <Card key={grade.id} backgroundColor={theme.card} className="gap-1">
              <View className="flex-row items-center justify-between gap-2">
                <ThemedText type="smallBold" className="flex-1">
                  {grade.title}
                </ThemedText>
                <ThemedText type="smallBold">{grade.grade}</ThemedText>
              </View>
              <View className="flex-row flex-wrap items-center gap-2">
                <Badge label={grade.type} tone="info" />
                <ThemedText type="small" themeColor="textSecondary">
                  {grade.subject} · {new Date(grade.date).toLocaleDateString()}
                </ThemedText>
              </View>
              <ThemedText type="small">
                {grade.score}/{grade.maxScore} ({grade.percentage.toFixed(1)}%)
              </ThemedText>
            </Card>
          ))}
        </View>
      </ScrollView>
    </QueryState>
  );
}

export default function ResultsScreen() {
  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Report" />
      <ChildGate loadingFallback={<SkeletonList count={4} lines={2} className="px-4 pt-4" />}>
        <Results />
      </ChildGate>
    </AppScreen>
  );
}
