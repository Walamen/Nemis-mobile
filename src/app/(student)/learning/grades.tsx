import { RefreshControl, ScrollView } from 'react-native';

import { useGetResultsQuery } from '@/api/grades/grades-api';
import { GradeCard } from '@/components/cards/grade-card';
import { EmptyState } from '@/components/common/empty-state';
import { QueryState } from '@/components/common/query-state';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { SkeletonList } from '@/components/loading/skeleton-list';
import { ThemedText } from '@/components/typography/themed-text';
import { ThemedView } from '@/components/common/themed-view';

export default function GradesScreen() {
  const { data, isLoading, isFetching, isError, refetch } = useGetResultsQuery();

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Grades" />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={data?.length === 0}
        onRetry={refetch}
        loadingFallback={<SkeletonList count={4} lines={2} className="px-4 pt-4" />}
        emptyFallback={
          <EmptyState
            icon={{ ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' }}
            title="No published grades yet"
            description="Check back once your teacher publishes results."
          />
        }
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          {data?.map((term) => (
            <ThemedView key={term.termId} style={{ marginBottom: 16, gap: 8 }}>
              <ThemedView
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <ThemedText type="smallBold">{term.termName}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  GPA: {term.gpa.toFixed(2)}
                </ThemedText>
              </ThemedView>
              {term.termAverages.map((subject) => (
                <GradeCard
                  key={subject.subjectId}
                  subjectName={subject.subjectName}
                  percentage={subject.average}
                  letterGrade={subject.letterGrade}
                />
              ))}
            </ThemedView>
          ))}
        </ScrollView>
      </QueryState>
    </AppScreen>
  );
}
